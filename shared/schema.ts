import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and basic info
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("patient"), // patient, doctor, admin
  createdAt: timestamp("created_at").defaultNow(),
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
  practiceAddress: text("practice_address"),
  isVerified: boolean("is_verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPatientSchema = createInsertSchema(patients).omit({ 
  id: true, 
  freeBookingsRemaining: true,
  membershipExpiresAt: true 
});
export const insertDoctorSchema = createInsertSchema(doctors).omit({ 
  id: true, 
  isVerified: true,
  rating: true,
  reviewCount: true 
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type User = typeof users.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Payment = typeof payments.$inferSelect;
