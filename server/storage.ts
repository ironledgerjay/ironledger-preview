import { 
  type User, 
  type InsertUser, 
  type Patient, 
  type InsertPatient, 
  type Doctor, 
  type InsertDoctor, 
  type Booking, 
  type InsertBooking, 
  type Payment, 
  type InsertPayment,
  type ActivityLog,
  type InsertActivityLog,
  type SystemNotification,
  type InsertSystemNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Patients
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatientMembership(patientId: string, membershipType: string): Promise<Patient>;

  // Doctors
  getDoctor(id: string): Promise<Doctor | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  getDoctors(filters: { province?: string; specialty?: string; city?: string }): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByPatient(patientId: string): Promise<Booking[]>;
  getBookingsByDoctor(doctorId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(payFastPaymentId: string, status: string): Promise<void>;

  // Platform stats
  getPlatformStats(): Promise<{
    totalDoctors: number;
    totalPatients: number;
    totalBookings: number;
    averageRating: number;
  }>;

  // Activity logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  logActivity(activityData: any): Promise<ActivityLog>;

  // System notifications
  createSystemNotification(notification: InsertSystemNotification): Promise<SystemNotification>;
  getSystemNotifications(targetSystem?: string): Promise<SystemNotification[]>;
  markNotificationAsRead(id: string): Promise<void>;

  // CRM support methods
  countUsers(): Promise<number>;
  countDoctors(): Promise<number>;
  getAllUsers(): Promise<any[]>;
  getAllPayments(): Promise<any[]>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patients: Map<string, Patient>;
  private doctors: Map<string, Doctor>;
  private bookings: Map<string, Booking>;
  private payments: Map<string, Payment>;
  private activityLogs: Map<string, ActivityLog>;
  private systemNotifications: Map<string, SystemNotification>;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.doctors = new Map();
    this.bookings = new Map();
    this.payments = new Map();
    this.activityLogs = new Map();
    this.systemNotifications = new Map();

    // Initialize with some mock data for demonstration
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock doctors for each province
    const mockDoctors = [
      {
        id: randomUUID(),
        userId: randomUUID(),
        firstName: 'Sarah',
        lastName: 'Mthembu',
        specialty: 'Cardiology',
        hpcsaNumber: 'MP123456',
        phone: '+27 11 123 4567',
        province: 'Gauteng',
        city: 'Johannesburg',
        practiceAddress: '123 Medical Centre, Sandton',
        isVerified: true,
        rating: '5.0',
        reviewCount: 127,
        consultationFee: '850.00',
      },
      {
        id: randomUUID(),
        userId: randomUUID(),
        firstName: 'Michael',
        lastName: 'Van Der Merwe',
        specialty: 'General Practice',
        hpcsaNumber: 'MP234567',
        phone: '+27 21 456 7890',
        province: 'Western Cape',
        city: 'Cape Town',
        practiceAddress: '456 Health Plaza, Claremont',
        isVerified: true,
        rating: '4.5',
        reviewCount: 89,
        consultationFee: '650.00',
      },
      {
        id: randomUUID(),
        userId: randomUUID(),
        firstName: 'Nomsa',
        lastName: 'Dlamini',
        specialty: 'Pediatrics',
        hpcsaNumber: 'MP345678',
        phone: '+27 31 789 0123',
        province: 'KwaZulu-Natal',
        city: 'Durban',
        practiceAddress: '789 Children\'s Clinic, Umhlanga',
        isVerified: true,
        rating: '5.0',
        reviewCount: 156,
        consultationFee: '750.00',
      },
    ];

    mockDoctors.forEach(doctor => {
      this.doctors.set(doctor.id, doctor);
      
      // Create corresponding user
      const user: User = {
        id: doctor.userId,
        email: `${doctor.firstName.toLowerCase()}.${doctor.lastName.toLowerCase()}@example.com`,
        role: 'doctor',
        createdAt: new Date(),
      };
      this.users.set(user.id, user);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || 'patient',
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Patients
  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.userId === userId);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = {
      ...insertPatient,
      id,
      phone: insertPatient.phone || null,
      dateOfBirth: insertPatient.dateOfBirth || null,
      province: insertPatient.province || null,
      membershipType: 'basic',
      freeBookingsRemaining: 0,
      membershipExpiresAt: null,
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatientMembership(patientId: string, membershipType: string): Promise<Patient> {
    const patient = this.patients.get(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const updatedPatient: Patient = {
      ...patient,
      membershipType,
      freeBookingsRemaining: membershipType === 'premium' ? 5 : 0,
      membershipExpiresAt: membershipType === 'premium' 
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        : null,
    };

    this.patients.set(patientId, updatedPatient);
    return updatedPatient;
  }

  // Doctors
  async getDoctor(id: string): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    return Array.from(this.doctors.values()).find(doctor => doctor.userId === userId);
  }

  async getDoctors(filters: { province?: string; specialty?: string; city?: string }): Promise<Doctor[]> {
    let doctors = Array.from(this.doctors.values());

    if (filters.province) {
      doctors = doctors.filter(doctor => doctor.province === filters.province);
    }

    if (filters.specialty) {
      doctors = doctors.filter(doctor => doctor.specialty === filters.specialty);
    }

    if (filters.city) {
      doctors = doctors.filter(doctor => doctor.city === filters.city);
    }

    return doctors;
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = randomUUID();
    const doctor: Doctor = {
      ...insertDoctor,
      id,
      phone: insertDoctor.phone || null,
      practiceAddress: insertDoctor.practiceAddress || null,
      isVerified: false,
      rating: '0.00',
      reviewCount: 0,
      consultationFee: insertDoctor.consultationFee || '650.00',
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByPatient(patientId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.patientId === patientId);
  }

  async getBookingsByDoctor(doctorId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.doctorId === doctorId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: 'pending',
      convenienceFee: insertBooking.convenienceFee || '10.00',
      paymentStatus: 'pending',
      paymentId: null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  // Payments
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      currency: insertPayment.currency || 'ZAR',
      status: insertPayment.status || 'pending',
      payFastPaymentId: null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(payFastPaymentId: string, status: string): Promise<void> {
    for (const [id, payment] of Array.from(this.payments.entries())) {
      if (payment.payFastPaymentId === payFastPaymentId) {
        this.payments.set(id, { ...payment, status });
        break;
      }
    }
  }

  // Platform stats
  async getPlatformStats(): Promise<{
    totalDoctors: number;
    totalPatients: number;
    totalBookings: number;
    averageRating: number;
  }> {
    const totalDoctors = this.doctors.size;
    const totalPatients = this.patients.size;
    const totalBookings = this.bookings.size;
    
    const ratings = Array.from(this.doctors.values())
      .map(doctor => parseFloat(doctor.rating || '0'))
      .filter(rating => rating > 0);
    
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      totalDoctors,
      totalPatients,
      totalBookings,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  // Activity logs
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = {
      ...insertLog,
      id,
      userId: insertLog.userId || null,
      entityType: insertLog.entityType || null,
      entityId: insertLog.entityId || null,
      details: insertLog.details || null,
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      source: insertLog.source || "main_site",
      createdAt: new Date(),
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    return logs;
  }

  async logActivity(activityData: any): Promise<ActivityLog> {
    const logData: InsertActivityLog = {
      userId: activityData.userId || null,
      action: activityData.action || 'page_view',
      entityType: activityData.page || 'page',
      entityId: activityData.resourceId || null,
      details: activityData.details || null,
      ipAddress: activityData.ipAddress || null,
      userAgent: activityData.userAgent || null,
      source: activityData.source || 'main_site',
    };
    return this.createActivityLog(logData);
  }

  // System notifications
  async createSystemNotification(insertNotification: InsertSystemNotification): Promise<SystemNotification> {
    const id = randomUUID();
    const notification: SystemNotification = {
      ...insertNotification,
      id,
      targetSystem: insertNotification.targetSystem || null,
      metadata: insertNotification.metadata || null,
      isRead: false,
      createdAt: new Date(),
      expiresAt: insertNotification.expiresAt || null,
    };
    this.systemNotifications.set(id, notification);
    return notification;
  }

  async getSystemNotifications(targetSystem?: string): Promise<SystemNotification[]> {
    const notifications = Array.from(this.systemNotifications.values())
      .filter(n => !targetSystem || n.targetSystem === targetSystem || n.targetSystem === 'both')
      .filter(n => !n.expiresAt || n.expiresAt > new Date())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    return notifications;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.systemNotifications.get(id);
    if (notification) {
      this.systemNotifications.set(id, { ...notification, isRead: true });
    }
  }

  // CRM support methods
  async countUsers(): Promise<number> {
    return this.users.size;
  }

  async countDoctors(): Promise<number> {
    return this.doctors.size;
  }

  async getRecentActivity(limit: number = 20): Promise<ActivityLog[]> {
    return this.getActivityLogs(limit);
  }

  async getAllUsers(): Promise<any[]> {
    return Array.from(this.users.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllPayments(): Promise<any[]> {
    const payments = Array.from(this.payments.values());
    const users = Array.from(this.users.values());
    
    return payments.map(payment => ({
      ...payment,
      user: users.find(user => user.id === payment.userId)
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
