import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertPatientSchema, insertDoctorSchema, insertBookingSchema, insertPaymentSchema } from "@shared/schema";
import authRoutes from './routes/authRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount authentication routes
  app.use('/api/auth', authRoutes);
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
      
      const { pf_payment_id, payment_status, custom_str1, amount_gross, name_first, name_last } = req.body;
      
      // Log PayFast webhook activity for admin tracking
      await storage.logActivity({
        action: 'payfast_webhook_received',
        page: 'payfast_webhook',
        details: {
          paymentStatus: payment_status,
          paymentId: pf_payment_id,
          amount: amount_gross,
          paymentType: custom_str1,
          customerName: `${name_first} ${name_last}`,
          timestamp: new Date().toISOString(),
        },
        source: 'payfast_system',
      });

      if (payment_status === 'COMPLETE') {
        await storage.updatePaymentStatus(pf_payment_id, 'COMPLETE');
        
        // Create notification for admin dashboard
        await storage.createSystemNotification({
          type: 'payment_completed',
          title: 'PayFast Payment Completed',
          message: `Payment of R${amount_gross} completed successfully via PayFast for ${custom_str1}.`,
          targetSystem: 'main_site',
          metadata: JSON.stringify({
            paymentId: pf_payment_id,
            amount: amount_gross,
            paymentMethod: 'payfast',
            paymentType: custom_str1,
            customerName: `${name_first} ${name_last}`,
          }),
        });

        // Update membership or booking based on payment type
        if (custom_str1 === 'membership') {
          // Update user to premium membership
          // This would require additional database logic
        }
      } else if (payment_status === 'FAILED') {
        await storage.updatePaymentStatus(pf_payment_id, 'FAILED');
        
        // Log failed payment for admin tracking
        await storage.createSystemNotification({
          type: 'payment_failed',
          title: 'PayFast Payment Failed',
          message: `Payment of R${amount_gross} failed via PayFast for ${custom_str1}.`,
          targetSystem: 'main_site',
          metadata: JSON.stringify({
            paymentId: pf_payment_id,
            amount: amount_gross,
            paymentMethod: 'payfast',
            paymentType: custom_str1,
            customerName: `${name_first} ${name_last}`,
          }),
        });
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
      const basicStats = await storage.getPlatformStats();
      const totalUsers = await storage.countUsers();
      const allUsers = await storage.getAllUsers();
      const allPayments = await storage.getAllPayments();
      
      // Calculate premium members (users with successful payments)
      const premiumMembers = allPayments
        .filter(payment => payment.status === 'COMPLETE' && payment.type === 'membership')
        .map(payment => payment.userId)
        .filter((userId, index, arr) => arr.indexOf(userId) === index)
        .length;
      
      // Calculate active users (users with activity in last 7 days)  
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = allUsers.filter(user => 
        new Date(user.createdAt) > sevenDaysAgo
      ).length;
      
      const enhancedStats = {
        ...basicStats,
        totalUsers,
        premiumMembers,
        activeUsers,
        timestamp: new Date().toISOString()
      };
      
      res.json(enhancedStats);
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

  // Get all users for CRM
  app.get("/api/crm/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get payment analytics for CRM
  app.get("/api/crm/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
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
        message: `Doctor ${isVerified ? 'approved and enlisted' : 'rejected'} successfully`,
        doctorId,
        doctor: doctor
      });
    } catch (error) {
      console.error("Error updating doctor verification:", error);
      res.status(500).json({ error: "Failed to update doctor verification" });
    }
  });

  // Remove user account (Admin only) - For policy violations
  app.delete("/api/crm/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove user and associated profiles (doctor/patient)
      await storage.removeUser(userId);
      
      // Log removal activity for admin tracking
      await storage.logActivity({
        userId: userId,
        userType: 'admin',
        action: 'user_account_removed',
        page: 'admin_crm',
        details: {
          userId: userId,
          userEmail: user.email,
          userRole: user.role,
          reason: reason || 'Policy violation',
          removedAt: new Date().toISOString(),
          adminAction: true,
        },
        source: 'admin_crm',
      });
      
      // Create system notification about account removal
      await storage.createSystemNotification({
        type: 'account_removed',
        title: 'User Account Removed',
        message: `User account ${user.email} (${user.role}) has been removed by admin for: ${reason || 'policy violation'}`,
        targetSystem: 'admin_crm',
        metadata: JSON.stringify({
          userId,
          userEmail: user.email,
          userRole: user.role,
          reason: reason || 'Policy violation',
          adminAction: true,
        }),
      });
      
      res.json({ 
        success: true, 
        message: 'User account removed successfully',
        removedUser: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('User removal error:', error);
      res.status(500).json({ message: 'Failed to remove user account' });
    }
  });

  // Doctor search API - Returns verified doctors based on filters
  app.get("/api/doctors", async (req, res) => {
    try {
      const { name, specialty, province, city, zipCode } = req.query;
      
      const allDoctors = await storage.getDoctors({});
      const verifiedDoctors = allDoctors.filter(doctor => doctor.isVerified);
      
      let filteredDoctors = verifiedDoctors;
      
      // Apply filters
      if (name) {
        const searchName = (name as string).toLowerCase();
        filteredDoctors = filteredDoctors.filter(doctor => 
          `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchName)
        );
      }
      
      if (specialty) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.specialty === specialty
        );
      }
      
      if (province) {
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.province === province
        );
      }
      
      if (city) {
        const searchCity = (city as string).toLowerCase();
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.city?.toLowerCase().includes(searchCity)
        );
      }
      
      if (zipCode) {
        const searchZip = (zipCode as string).toLowerCase();
        filteredDoctors = filteredDoctors.filter(doctor => 
          doctor.zipCode?.toLowerCase().includes(searchZip) ||
          doctor.practiceAddress?.toLowerCase().includes(searchZip)
        );
      }
      
      res.json(filteredDoctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  // Doctor portal profile API
  app.get("/api/doctor/profile", async (req, res) => {
    try {
      // For demo, always return the demo doctor data with metrics
      const doctorProfile = {
        id: 'doctor-michael-johnson',
        firstName: 'Michael',
        lastName: 'Johnson',
        specialty: 'Cardiology',
        province: 'Gauteng',
        city: 'Johannesburg',
        phone: '+27 11 123 4567',
        rating: '4.8',
        reviewCount: 127,
        consultationFee: '650',
        totalPatients: 234,
        totalAppointments: 456,
        pendingAppointments: 3
      };
      
      res.json(doctorProfile);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      res.status(500).json({ error: "Failed to fetch doctor profile" });
    }
  });

  // Doctor appointments API
  app.get("/api/doctor/appointments", async (req, res) => {
    try {
      const doctorId = req.query.doctorId || '8fb4ade4-e06b-41d4-89ee-8baddc6449ef';
      
      const doctorBookings = (await storage.getBookingsByDoctor(doctorId))
        .map(booking => ({
          id: booking.id,
          patientName: booking.patientName || 'Patient',
          patientEmail: booking.patientEmail || 'patient@example.com',
          appointmentDate: booking.appointmentDate,
          status: booking.status,
          reason: booking.reason || 'General consultation',
          consultationType: booking.consultationType || 'in-person'
        }))
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
      
      res.json(doctorBookings);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Update appointment status API  
  app.patch("/api/doctor/appointments/:appointmentId", async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;
      
      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const booking = await storage.getBooking(appointmentId);
      if (!booking) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      await storage.updateBooking(appointmentId, { ...booking, status });
      
      res.json({ success: true, message: `Appointment ${status}` });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  // Doctor analytics API
  app.get("/api/doctor/analytics", async (req, res) => {
    try {
      const doctorId = req.query.doctorId || '8fb4ade4-e06b-41d4-89ee-8baddc6449ef';
      
      const doctor = await storage.getDoctor(doctorId);
      const doctorBookings = await storage.getBookingsByDoctor(doctorId);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const thisMonthBookings = doctorBookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      const consultationFee = parseFloat(doctor?.consultationFee || '0');
      const monthlyRevenue = thisMonthBookings
        .filter(booking => booking.status === 'confirmed')
        .length * consultationFee;
      
      const analytics = {
        monthlyRevenue,
        totalPatients: new Set(doctorBookings.map(b => b.patientId)).size,
        appointmentsThisMonth: thisMonthBookings.length,
        averageRating: parseFloat(doctor?.rating || '0'),
        popularTimeSlots: [
          { time: '09:00', count: 12 },
          { time: '14:00', count: 8 },
          { time: '16:00', count: 15 }
        ],
        revenueByMonth: [
          { month: 'Jan', revenue: 5200 },
          { month: 'Feb', revenue: 6800 },
          { month: 'Mar', revenue: monthlyRevenue }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching doctor analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Admin impersonation API - Approve/decline appointments on behalf of doctors
  app.patch("/api/admin/appointments/:appointmentId/impersonate", async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status, adminReason } = req.body;
      
      if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const booking = await storage.getBooking(appointmentId);
      if (!booking) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      await storage.updateBooking(appointmentId, { ...booking, status });
      
      // Log admin impersonation action
      await storage.logActivity({
        userId: booking.doctorId,
        userType: 'admin',
        action: 'admin_appointment_impersonation',
        page: 'admin_appointments',
        details: {
          appointmentId,
          originalStatus: booking.status,
          newStatus: status,
          adminReason: adminReason || 'Admin impersonation',
          patientName: booking.patientName,
          timestamp: new Date().toISOString(),
        },
        source: 'admin_crm',
      });
      
      res.json({ 
        success: true, 
        message: `Appointment ${status} by admin impersonation`,
        appointmentId 
      });
    } catch (error) {
      console.error("Error with admin appointment impersonation:", error);
      res.status(500).json({ error: "Failed to process admin action" });
    }
  });

  // Individual doctor API endpoint
  app.get("/api/doctor/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      console.log(`Fetching doctor with ID: ${doctorId}`);
      
      // Get doctor by doctor ID
      let doctor = await storage.getDoctor(doctorId);
      
      // If not found by doctor ID, try to get by user ID from all doctors
      if (!doctor) {
        const doctors = await storage.getDoctors({});
        doctor = doctors.find(d => d.userId === doctorId || d.id === doctorId);
        console.log(`Available doctors: ${doctors.map(d => `${d.id} (${d.firstName} ${d.lastName})`).join(', ')}`);
      }
      
      if (!doctor) {
        console.log(`Doctor not found with ID: ${doctorId}`);
        return res.status(404).json({ error: "Doctor not found" });
      }
      
      console.log(`Found doctor: ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id})`);
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ error: "Failed to fetch doctor" });
    }
  });

  // Create booking API
  app.post("/api/bookings", async (req, res) => {
    try {
      const {
        patientId,
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDateTime,
        reason,
        consultationType,
        bookingFee
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !patientName || !patientEmail || !appointmentDateTime || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if doctor exists
      const doctor = await storage.getDoctor(doctorId);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      // Create booking
      const bookingData = {
        patientId,
        doctorId,
        appointmentDate: appointmentDateTime,
        status: 'pending' as const,
        patientName,
        patientEmail,
        patientPhone: patientPhone || null,
        reason,
        consultationType: consultationType || 'in-person',
        bookingFee: bookingFee || 0,
      };

      const booking = await storage.createBooking(bookingData);

      // Send notifications to Admin and Doctor
      await storage.createSystemNotification({
        type: 'new_booking',
        title: 'New Appointment Booking',
        message: `New appointment booked with ${doctor.firstName} ${doctor.lastName}`,
        data: {
          bookingId: booking.id,
          patientName: booking.patientName,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: appointmentDateTime,
          consultationType: booking.consultationType,
          reason: booking.reason
        },
        targetSystem: 'admin',
        isRead: false,
        createdAt: new Date()
      });

      await storage.createSystemNotification({
        type: 'new_booking',
        title: 'New Patient Appointment',
        message: `${booking.patientName} has booked an appointment`,
        data: {
          bookingId: booking.id,
          patientName: booking.patientName,
          patientEmail: booking.patientEmail,
          appointmentDate: appointmentDateTime,
          consultationType: booking.consultationType,
          reason: booking.reason
        },
        targetSystem: 'doctor',
        targetUserId: doctor.userId,
        isRead: false,
        createdAt: new Date()
      });

      // Log booking activity
      await storage.logActivity({
        userId: patientId,
        userType: 'patient',
        action: 'appointment_booked',
        page: 'book_appointment',
        details: {
          bookingId: booking.id,
          doctorId,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          appointmentDate: appointmentDateTime,
          consultationType,
          bookingFee,
          timestamp: new Date().toISOString(),
        },
        source: 'main_site',
      });

      res.status(201).json({ bookingId: booking.id, message: "Booking created successfully" });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Get user membership information
  app.get("/api/user/membership", async (req, res) => {
    try {
      // In a real app, get user ID from authenticated session
      // For demo purposes, return mock membership data
      const membership = {
        type: 'basic', // or 'premium'
        expiresAt: null,
        benefits: ['Basic booking access', 'R10 booking fees apply']
      };
      
      res.json(membership);
    } catch (error) {
      console.error("Error fetching membership:", error);
      res.status(500).json({ error: "Failed to fetch membership" });
    }
  });

  // Get doctor bookings for real-time portal updates
  app.get("/api/doctor/bookings/:doctorId", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const bookings = await storage.getBookingsByDoctor(doctorId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching doctor bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get doctor availability for a specific date
  app.get("/api/doctor/availability/:doctorId/:date", async (req, res) => {
    try {
      const { doctorId, date } = req.params;
      
      // Get existing bookings for this doctor on this date
      const allBookings = await storage.getBookingsByDoctor(doctorId);
      const dateBookings = allBookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0];
        return bookingDate === date && booking.status !== 'cancelled';
      });

      // Generate time slots and mark which are booked
      const timeSlots = [];
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute of [0, 30]) {
          if (hour === 18 && minute === 30) break;
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if this time slot is already booked
          const isBooked = dateBookings.some(booking => {
            const bookingTime = new Date(booking.appointmentDate).toTimeString().slice(0, 5);
            return bookingTime === time;
          });
          
          timeSlots.push({
            time,
            isBooked,
            isAvailable: !isBooked
          });
        }
      }

      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  // Update booking status
  app.put("/api/bookings/:bookingId/status", async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Update booking status in storage
      const updatedBooking = await storage.updateBookingStatus(bookingId, status);
      
      // Send notification to admin when doctor confirms/rejects appointment
      if (status === 'confirmed' || status === 'rejected') {
        await storage.createSystemNotification({
          type: 'booking_status_updated',
          title: `Appointment ${status}`,
          message: `Dr. ${doctor?.firstName} ${doctor?.lastName} has ${status} appointment with ${booking.patientName}`,
          data: {
            bookingId: booking.id,
            doctorName: `${doctor?.firstName} ${doctor?.lastName}`,
            patientName: booking.patientName,
            appointmentDate: booking.appointmentDate,
            oldStatus: booking.status,
            newStatus: status
          },
          targetSystem: 'admin',
          isRead: false,
          createdAt: new Date()
        });
      }
      
      // Log status change
      await storage.logActivity({
        userId: booking.doctorId,
        userType: 'doctor',
        action: 'booking_status_updated',
        page: 'doctor_portal',
        details: {
          bookingId,
          oldStatus: booking.status,
          newStatus: status,
          patientName: booking.patientName,
          timestamp: new Date().toISOString(),
        },
        source: 'doctor_portal',
      });

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Doctor availability API with real-time booking status
  app.get("/api/doctor/availability/:doctorId/:date", async (req, res) => {
    try {
      const { doctorId, date } = req.params;
      
      // Get all bookings for this doctor on this date
      const bookings = await storage.getBookingsByDoctor(doctorId);
      const dateBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate).toISOString().split('T')[0];
        return bookingDate === date && (booking.status === 'confirmed' || booking.status === 'pending');
      });
      
      // Generate time slots from 8 AM to 6 PM (30-minute intervals)
      const timeSlots = [];
      for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
          
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Check if this time slot is booked
          const bookedSlot = dateBookings.find(booking => {
            const bookingTime = new Date(booking.appointmentDate);
            const bookingHour = bookingTime.getHours();
            const bookingMinute = bookingTime.getMinutes();
            return bookingHour === hour && bookingMinute === minute;
          });
          
          timeSlots.push({
            time,
            isBooked: !!bookedSlot,
            isAvailable: !bookedSlot,
            status: bookedSlot ? (bookedSlot.status === 'confirmed' ? 'confirmed' : 'pending') : 'available',
            bookingId: bookedSlot?.id || null
          });
        }
      }
      
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  // Doctor signup/registration API
  app.post("/api/doctors/signup", async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        specialty,
        hpcsaNumber,
        phone,
        province,
        city,
        zipCode,
        practiceAddress,
        consultationFee,
        qualifications,
        experience
      } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Create user account
      const user = await storage.createUser({
        email,
        role: 'doctor'
      });
      
      // Create doctor profile (pending approval)
      const doctor = await storage.createDoctor({
        userId: user.id,
        firstName,
        lastName,
        specialty,
        hpcsaNumber,
        phone,
        province,
        city,
        zipCode,
        practiceAddress,
        consultationFee: consultationFee || '650.00',
        isVerified: false // Requires admin approval
      });
      
      // Send notification to admin for approval
      await storage.createSystemNotification({
        type: 'doctor_signup',
        title: 'New Doctor Registration',
        message: `Dr. ${firstName} ${lastName} has registered and requires approval`,
        data: {
          doctorId: doctor.id,
          doctorName: `${firstName} ${lastName}`,
          specialty,
          province,
          email,
          hpcsaNumber
        },
        targetSystem: 'admin',
        isRead: false,
        createdAt: new Date()
      });
      
      // Log enrollment activity
      await storage.logActivity({
        userId: user.id,
        userType: 'doctor',
        action: 'doctor_registration',
        page: 'doctor_signup',
        details: {
          doctorId: doctor.id,
          specialty: doctor.specialty,
          province: doctor.province,
          timestamp: new Date().toISOString(),
        },
        source: 'main_site',
      });
      
      res.status(201).json({ 
        message: "Registration successful! Your application is under review. You will be notified once approved.",
        doctorId: doctor.id,
        email: email,
        tempPassword: "TempPass123!" // Temporary password for initial login
      });
    } catch (error) {
      console.error("Error registering doctor:", error);
      res.status(500).json({ error: "Failed to register doctor" });
    }
  });

  // Doctor login API
  app.post("/api/doctors/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== 'doctor') {
        return res.status(401).json({ error: "Invalid credentials or not a doctor account" });
      }
      
      // Get doctor profile
      const doctor = await storage.getDoctorByUserId(user.id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor profile not found" });
      }
      
      // Check if approved
      if (!doctor.isVerified) {
        return res.status(403).json({ 
          error: "Account pending approval", 
          message: "Your doctor account is still under review by our admin team." 
        });
      }
      
      // Simulate password check (in real app, use proper hashing)
      // For demo: accept "TempPass123!" or "password123"
      if (password !== "TempPass123!" && password !== "password123") {
        return res.status(401).json({ error: "Invalid password" });
      }
      
      // Log successful login
      await storage.logActivity({
        userId: user.id,
        userType: 'doctor',
        action: 'doctor_login',
        page: 'doctor_login',
        details: {
          doctorId: doctor.id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          timestamp: new Date().toISOString(),
        },
        source: 'doctor_portal',
      });
      
      res.json({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        doctor: {
          id: doctor.id,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialty: doctor.specialty,
          isVerified: doctor.isVerified
        }
      });
    } catch (error) {
      console.error("Error during doctor login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Doctor approval API (for admin)
  app.patch("/api/admin/doctors/:doctorId/approve", async (req, res) => {
    try {
      const { doctorId } = req.params;
      const doctor = await storage.getDoctor(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      
      // Approve doctor (update verification status)
      const updatedDoctor = await storage.updateDoctorVerification(doctorId, true);
      
      // Log approval activity
      await storage.logActivity({
        userId: null,
        userType: 'admin',
        action: 'doctor_approved',
        page: 'admin_portal',
        details: {
          doctorId: doctor.id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          timestamp: new Date().toISOString(),
        },
        source: 'admin_portal',
      });
      
      res.json({ message: "Doctor approved successfully", doctor: updatedDoctor });
    } catch (error) {
      console.error("Error approving doctor:", error);
      res.status(500).json({ error: "Failed to approve doctor" });
    }
  });

  // Removed duplicate doctor profile endpoint

  // Doctor schedule management
  app.get("/api/doctor/schedule", async (req, res) => {
    try {
      // Return default schedule structure for demo
      const schedule = {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: false },
        sunday: { start: "09:00", end: "13:00", available: false }
      };
      
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  app.put("/api/doctor/schedule", async (req, res) => {
    try {
      const { schedule } = req.body;
      
      // Store schedule in memory for demo (in real app, save to database)
      global.doctorSchedule = schedule;
      
      // Log schedule update activity
      await storage.logActivity({
        userId: 'user-michael-johnson',
        userType: 'doctor',
        action: 'schedule_updated',
        page: 'doctor_portal',
        details: {
          schedule: schedule,
          timestamp: new Date().toISOString(),
        },
        source: 'doctor_portal',
      });
      
      res.json({ message: "Schedule updated successfully", schedule });
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  // Get doctor's current schedule for booking
  app.get("/api/doctors/:doctorId/schedule", async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      // Return default schedule for all doctors
      const schedule = {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: false },
        sunday: { start: "09:00", end: "13:00", available: false }
      };
      
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  // Get available time slots for a specific doctor and date
  app.get("/api/doctors/:doctorId/available-slots", async (req, res) => {
    try {
      console.log('Available slots request:', req.params, req.query);
      const { doctorId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      
      const requestedDate = new Date(date as string);
      const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      console.log('Processing date:', date, 'dayName:', dayName);
      
      // Get doctor's default schedule
      const schedule = {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: false },
        sunday: { start: "09:00", end: "13:00", available: false }
      };
      
      const daySchedule = schedule[dayName];
      
      if (!daySchedule || !daySchedule.available) {
        return res.json({ availableSlots: [] });
      }
      
      // Generate 30-minute time slots
      const slots = [];
      const startTime = new Date(`${date}T${daySchedule.start}:00`);
      const endTime = new Date(`${date}T${daySchedule.end}:00`);
      
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        
        // Check if slot is already booked
        const existingBookings = await storage.getBookingsByDoctor(doctorId);
        const isBooked = existingBookings.some(booking => {
          const bookingDate = new Date(booking.appointmentDate);
          return bookingDate.toDateString() === requestedDate.toDateString() &&
                 bookingDate.getHours() === currentTime.getHours() &&
                 bookingDate.getMinutes() === currentTime.getMinutes() &&
                 booking.status !== 'cancelled';
        });
        
        if (!isBooked) {
          slots.push({
            time: timeString,
            available: true,
            datetime: currentTime.toISOString()
          });
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
      
      res.json({ availableSlots: slots });
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
