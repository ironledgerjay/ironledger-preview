import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@medmap.co.za';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? {
      user: SMTP_USER,
      pass: SMTP_PASS,
    } : undefined,
  });

  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }

  static async sendEmailVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #0d9488;">Welcome to IronLedger MedMap!</h2>
        
        <p>Thank you for registering with IronLedger MedMap. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This verification link will expire in 24 hours. If you didn't create an account with IronLedger MedMap, please ignore this email.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          IronLedger MedMap - Connecting South African patients with verified medical professionals
        </p>
      </div>
    `;

    await this.sendEmail(email, 'Verify Your Email Address - IronLedger MedMap', html);
  }

  static async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        
        <p>We received a request to reset your password for your IronLedger MedMap account. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          IronLedger MedMap - Connecting South African patients with verified medical professionals
        </p>
      </div>
    `;

    await this.sendEmail(email, 'Password Reset Request - IronLedger MedMap', html);
  }

  static async sendDoctorApproval(email: string, doctorName: string): Promise<void> {
    const loginUrl = `${FRONTEND_URL}/login`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #059669;">Doctor Application Approved!</h2>
        
        <p>Dear Dr. ${doctorName},</p>
        
        <p>Congratulations! Your doctor application has been approved by our admin team. You can now access your doctor portal and start managing your practice on IronLedger MedMap.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Doctor Portal
          </a>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Configure your weekly schedule</li>
          <li>Set up your consultation preferences</li>
          <li>Review and manage patient bookings</li>
          <li>Complete your professional profile</li>
        </ul>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Welcome to the IronLedger MedMap community of verified medical professionals.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          IronLedger MedMap - Connecting South African patients with verified medical professionals
        </p>
      </div>
    `;

    await this.sendEmail(email, 'Doctor Application Approved - IronLedger MedMap', html);
  }

  static async sendDoctorRejection(email: string, doctorName: string, reason?: string): Promise<void> {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">Doctor Application Status Update</h2>
        
        <p>Dear Dr. ${doctorName},</p>
        
        <p>Thank you for your interest in joining IronLedger MedMap. After careful review, we are unable to approve your doctor application at this time.</p>
        
        ${reason ? `
          <div style="background-color: #fef3f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <strong>Reason:</strong> ${reason}
          </div>
        ` : ''}
        
        <p>If you have any questions about this decision or would like to submit additional documentation, please contact our support team.</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          We appreciate your interest in our platform and encourage you to reapply if your circumstances change.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          IronLedger MedMap - Connecting South African patients with verified medical professionals
        </p>
      </div>
    `;

    await this.sendEmail(email, 'Doctor Application Update - IronLedger MedMap', html);
  }

  static async send2FACode(email: string, code: string): Promise<void> {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #0d9488;">Two-Factor Authentication Code</h2>
        
        <p>Your two-factor authentication code for IronLedger MedMap:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0d9488; background-color: #f0fdfa; padding: 20px; border-radius: 8px; display: inline-block;">
            ${code}
          </div>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          IronLedger MedMap - Connecting South African patients with verified medical professionals
        </p>
      </div>
    `;

    await this.sendEmail(email, 'Two-Factor Authentication Code - IronLedger MedMap', html);
  }
}