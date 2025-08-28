import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and basic info
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("patient"), // patient, doctor, admin
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  twoFactorSecret: text("two_factor_secret"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  loginAttempts: integer("login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table for JWT token management
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  tokenHash: text("token_hash").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor verification documents
export const doctorDocuments = pgTable("doctor_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  documentType: text("document_type").notNull(), // hpcsa_certificate, degree, id_document, practice_license
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  verificationStatus: text("verification_status").default("pending"), // pending, verified, rejected
  verificationNotes: text("verification_notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: uuid("verified_by").references(() => users.id),
});

// Patient profiles
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  province: text("province"),
  membershipType: text("membership_type").default("basic"), // basic, premium
  freeBookingsRemaining: integer("free_bookings_remaining").default(0),
  membershipExpiresAt: timestamp("membership_expires_at"),
});

// Doctor profiles
export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialty: text("specialty").notNull(),
  hpcsaNumber: text("hpcsa_number").notNull(),
  phone: text("phone"),
  province: text("province").notNull(),
  city: text("city").notNull(),
  zipCode: text("zip_code"),
  practiceAddress: text("practice_address"),
  qualifications: text("qualifications"),
  experience: text("experience"),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: text("verification_status").default("pending"), // pending, under_review, verified, rejected
  verificationNotes: text("verification_notes"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: uuid("patient_id").references(() => patients.id).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  status: text("status").default("pending"), // pending, confirmed, completed, cancelled
  convenienceFee: decimal("convenience_fee", { precision: 10, scale: 2 }).default("10.00"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("ZAR"),
  type: text("type").notNull(), // membership, booking, convenience_fee
  status: text("status").default("pending"), // pending, completed, failed
  payFastPaymentId: text("payfast_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity logs for CRM tracking
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(), // login, booking_created, payment_completed, etc.
  entityType: text("entity_type"), // user, booking, payment, doctor
  entityId: uuid("entity_id"),
  details: text("details"), // JSON string with additional context
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  source: text("source").default("main_site"), // main_site, admin_crm
  createdAt: timestamp("created_at").defaultNow(),
});

// System notifications for cross-communication
export const systemNotifications = pgTable("system_notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error, success
  source: text("source").notNull(), // main_site, admin_crm
  targetSystem: text("target_system"), // main_site, admin_crm, both
  isRead: boolean("is_read").default(false),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  loginAttempts: true, 
  lockedUntil: true, 
  lastLogin: true,
  isEmailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  twoFactorSecret: true,
  isTwoFactorEnabled: true
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ 
  id: true, 
  createdAt: true, 
  isRevoked: true 
});

export const insertDoctorDocumentSchema = createInsertSchema(doctorDocuments).omit({ 
  id: true, 
  uploadedAt: true, 
  verifiedAt: true, 
  verifiedBy: true,
  verificationStatus: true,
  verificationNotes: true
});

export const insertPatientSchema = createInsertSchema(patients).omit({ 
  id: true, 
  freeBookingsRemaining: true,
  membershipExpiresAt: true 
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({ 
  id: true, 
  isVerified: true,
  verificationStatus: true,
  verificationNotes: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true,
  paymentStatus: true,
  paymentId: true 
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  createdAt: true 
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export const insertSystemNotificationSchema = createInsertSchema(systemNotifications).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type DoctorDocument = typeof doctorDocuments.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type SystemNotification = typeof systemNotifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type InsertDoctorDocument = z.infer<typeof insertDoctorDocumentSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type InsertSystemNotification = z.infer<typeof insertSystemNotificationSchema>;
