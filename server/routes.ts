import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertPatientSchema, insertDoctorSchema, insertBookingSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create user profile (Signup endpoint)
  app.post("/api/users", async (req, res) => {
    try {
      const { userType, firstName, lastName, email, phone, province, city, ...extraData } = req.body;
      
      // Create base user
      const userData = {
        firstName,
        lastName,
        email,
        phone: phone || null,
        role: userType === 'doctor' ? 'doctor' : 'patient',
      };
      
      const user = await storage.createUser(userData);
      
      // Create specific profile based on user type
      let profile = null;
      if (userType === 'doctor') {
        // Create doctor profile
        const doctorData = {
          userId: user.id,
          firstName,
          lastName,
          email,
          phone: phone || null,
          specialty: extraData.specialty || 'General Practice',
          province: province || null,
          city: city || null,
          hpcsaNumber: extraData.hpcsaNumber || null,
          practiceAddress: extraData.practiceAddress || null,
          bio: extraData.bio || null,
          isVerified: false, // Doctors need manual verification
        };
        
        profile = await storage.createDoctor(doctorData);
        
        // Log to CRM system
        await storage.logActivity({
          userId: user.id,
          userType: 'doctor',
          action: 'doctor_registration',
          page: 'signup',
          details: {
            specialty: doctorData.specialty,
            province: doctorData.province,
            hpcsaNumber: doctorData.hpcsaNumber,
            requiresVerification: true,
          },
          source: 'main_site',
        });
        
        // Create notification for CRM
        await storage.createSystemNotification({
          type: 'doctor_registration',
          title: 'New Doctor Registration',
          message: `Dr. ${firstName} ${lastName} has registered and requires verification`,
          targetSystem: 'admin_crm',
          metadata: JSON.stringify({
            doctorId: profile.id,
            userId: user.id,
            specialty: doctorData.specialty,
            hpcsaNumber: doctorData.hpcsaNumber,
            priority: 'high',
          }),
        });
        
      } else {
        // Create patient profile
        const patientData = {
          userId: user.id,
          firstName,
          lastName,
          email,
          phone: phone || null,
          dateOfBirth: null,
          province: province || null,
        };
        
        profile = await storage.createPatient(patientData);
        
        // Log to CRM system
        await storage.logActivity({
          userId: user.id,
          userType: 'patient',
          action: 'patient_registration',
          page: 'signup',
          details: {
            province: patientData.province,
          },
          source: 'main_site',
        });
      }
      
      res.status(201).json({ user, profile });
    } catch (error) {
      console.error('User creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create user' });
    }
  });

  // User registration and profile creation
  app.post("/api/users/profile", async (req, res) => {
    try {
      const profileData = req.body;
      
      // First create the user record
      const userData = {
        email: profileData.email,
        role: profileData.role,
      };
      
      const user = await storage.createUser(userData);
      
      // Then create role-specific profile
      if (profileData.role === 'patient') {
        const patientData = {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          dateOfBirth: profileData.dateOfBirth,
          province: profileData.province,
        };
        
        const patient = await storage.createPatient(patientData);
        res.json({ user, patient });
      } else if (profileData.role === 'doctor') {
        const doctorData = {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          specialty: profileData.specialty,
          hpcsaNumber: profileData.hpcsaNumber,
          phone: profileData.phone,
          province: profileData.province,
          city: profileData.city || '',
        };
        
        const doctor = await storage.createDoctor(doctorData);
        res.json({ user, doctor });
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create profile' });
    }
  });

  // Get user profile
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let profile = null;
      if (user.role === 'patient') {
        profile = await storage.getPatientByUserId(userId);
      } else if (user.role === 'doctor') {
        profile = await storage.getDoctorByUserId(userId);
      }
      
      res.json({ user, profile });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  // Get all doctors with optional filtering
  app.get("/api/doctors", async (req, res) => {
    try {
      const { province, specialty, city } = req.query;
      const filters = {
        province: province as string,
        specialty: specialty as string,
        city: city as string,
      };
      
      const doctors = await storage.getDoctors(filters);
      res.json(doctors);
    } catch (error) {
      console.error('Doctors fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch doctors' });
    }
  });

  // Get doctor by ID
  app.get("/api/doctors/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const doctor = await storage.getDoctor(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error) {
      console.error('Doctor fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch doctor' });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingSchema = insertBookingSchema.extend({
        appointmentDate: z.string().transform(str => new Date(str)),
      });
      
      const bookingData = bookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      res.json(booking);
    } catch (error) {
      console.error('Booking creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create booking' });
    }
  });

  // Get bookings for a patient
  app.get("/api/patients/:patientId/bookings", async (req, res) => {
    try {
      const { patientId } = req.params;
      const bookings = await storage.getBookingsByPatient(patientId);
      res.json(bookings);
    } catch (error) {
      console.error('Patient bookings fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  // Get bookings for a doctor
  app.get("/api/doctors/:doctorId/bookings", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const bookings = await storage.getBookingsByDoctor(doctorId);
      res.json(bookings);
    } catch (error) {
      console.error('Doctor bookings fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch bookings' });
    }
  });

  // Process payment
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      
      res.json(payment);
    } catch (error) {
      console.error('Payment creation error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create payment' });
    }
  });

  // PayFast webhook for payment notifications
  app.post("/api/payfast/notify", async (req, res) => {
    try {
      // In a real implementation, you would:
      // 1. Verify the PayFast signature
      // 2. Update payment status in database
      // 3. Update user membership or booking status
      
      const { pf_payment_id, payment_status, custom_str1 } = req.body;
      
      if (payment_status === 'COMPLETE') {
        await storage.updatePaymentStatus(pf_payment_id, 'completed');
        
        // Update membership or booking based on payment type
        if (custom_str1 === 'membership') {
          // Update user to premium membership
          // This would require additional database logic
        }
      }
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('PayFast webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Update user membership
  app.patch("/api/patients/:patientId/membership", async (req, res) => {
    try {
      const { patientId } = req.params;
      const { membershipType } = req.body;
      
      const patient = await storage.updatePatientMembership(patientId, membershipType);
      res.json(patient);
    } catch (error) {
      console.error('Membership update error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update membership' });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      });
      
      const contactData = contactSchema.parse(req.body);
      
      // In a real implementation, you would:
      // 1. Send email notification
      // 2. Store in database for tracking
      // 3. Auto-respond to user
      
      console.log('Contact form submission:', contactData);
      
      res.json({ message: 'Contact form submitted successfully' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to submit contact form' });
    }
  });

  // Get platform statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // CRM Communication API endpoints for live data sharing
  
  // Get live platform statistics for CRM dashboard
  app.get("/api/crm/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      const userCount = await storage.countUsers();
      const doctorCount = await storage.countDoctors();
      
      res.json({
        ...stats,
        totalUsers: userCount,
        totalVerifiedDoctors: doctorCount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching CRM stats:", error);
      res.status(500).json({ error: "Failed to fetch platform statistics" });
    }
  });

  // Get recent activity logs for CRM monitoring
  app.get("/api/crm/activity", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Create activity log (for CRM actions)
  app.post("/api/crm/activity", async (req, res) => {
    try {
      const logData = {
        ...req.body,
        source: "admin_crm",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      const log = await storage.createActivityLog(logData);
      res.json(log);
    } catch (error) {
      console.error("Error creating activity log:", error);
      res.status(500).json({ error: "Failed to create activity log" });
    }
  });

  // Get system notifications for cross-system communication
  app.get("/api/crm/notifications", async (req, res) => {
    try {
      const targetSystem = req.query.target as string || "admin_crm";
      const notifications = await storage.getSystemNotifications(targetSystem);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Create system notification for cross-system alerts
  app.post("/api/crm/notifications", async (req, res) => {
    try {
      const notification = await storage.createSystemNotification(req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  // Get all doctors with details for CRM
  app.get("/api/crm/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors({});
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Get unverified doctors pending approval for CRM
  app.get("/api/crm/doctors/pending", async (req, res) => {
    try {
      const allDoctors = await storage.getDoctors({});
      const pendingDoctors = allDoctors.filter(doctor => !doctor.isVerified);
      res.json(pendingDoctors);
    } catch (error) {
      console.error("Error fetching pending doctors for CRM:", error);
      res.status(500).json({ error: "Failed to fetch pending doctors" });
    }
  });

  // Approve/verify a doctor (CRM action)
  app.patch("/api/crm/doctors/:doctorId/verify", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { isVerified, notes } = req.body;
      
      const doctor = await storage.getDoctor(doctorId);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      // Log the CRM action
      await storage.logActivity({
        userId: doctor.userId,
        userType: 'admin',
        action: isVerified ? 'doctor_approved' : 'doctor_rejected',
        page: 'admin_crm',
        details: {
          doctorId: doctorId,
          adminNotes: notes || null,
          timestamp: new Date().toISOString(),
        },
        source: 'admin_crm',
      });

      // Create notification for the doctor
      await storage.createSystemNotification({
        type: isVerified ? 'doctor_approved' : 'doctor_rejected',
        title: isVerified ? 'Account Approved' : 'Account Needs Review',
        message: isVerified 
          ? `Congratulations! Your doctor account has been approved and is now active.`
          : `Your doctor account requires additional information. Please check your email for details.`,
        targetSystem: 'main_site',
        metadata: JSON.stringify({
          doctorId,
          userId: doctor.userId,
          adminAction: true,
          notes: notes || null,
        }),
      });

      res.json({ 
        success: true, 
        message: `Doctor ${isVerified ? 'approved' : 'rejected'} successfully`,
        doctorId,
        doctor: doctor
      });
    } catch (error) {
      console.error("Error updating doctor verification:", error);
      res.status(500).json({ error: "Failed to update doctor verification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
