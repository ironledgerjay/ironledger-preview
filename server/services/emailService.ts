import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailTemplate {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private readonly fromEmail = 'support@ironledgermedmap.com';

  async sendWelcomeEmail(userEmail: string, firstName: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    // For now, log the verification details and return true to not block user registration
    console.log(`=== EMAIL VERIFICATION DEBUG ===`);
    console.log(`To: ${userEmail}`);
    console.log(`Name: ${firstName}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${verificationToken}`);
    console.log(`================================`);
    
    const emailTemplate: EmailTemplate = {
      to: userEmail,
      from: this.fromEmail,
      subject: 'Welcome to IronLedger MedMap - Verify Your Account',
      html: this.getWelcomeEmailTemplate(firstName, verificationUrl),
      text: this.getWelcomeEmailText(firstName, verificationUrl)
    };

    try {
      // Try to send email, but don't fail registration if email fails
      await sgMail.send(emailTemplate);
      console.log(`Welcome email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Email sending failed (but user registration will continue):', error);
      console.log(`MANUAL VERIFICATION: User can verify at: ${verificationUrl}`);
      return true; // Return true so user registration doesn't fail
    }
  }

  async sendDoctorWelcomeEmail(userEmail: string, firstName: string, lastName: string): Promise<boolean> {
    console.log(`=== DOCTOR REGISTRATION EMAIL DEBUG ===`);
    console.log(`To: ${userEmail}`);
    console.log(`Doctor: Dr. ${firstName} ${lastName}`);
    console.log(`=======================================`);
    
    const emailTemplate: EmailTemplate = {
      to: userEmail,
      from: this.fromEmail,
      subject: 'Welcome to IronLedger MedMap - Doctor Registration Received',
      html: this.getDoctorWelcomeTemplate(firstName, lastName),
      text: this.getDoctorWelcomeText(firstName, lastName)
    };

    try {
      await sgMail.send(emailTemplate);
      console.log(`Doctor welcome email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Doctor email sending failed (but registration will continue):', error);
      return true; // Return true so doctor registration doesn't fail
    }
  }

  async sendVerificationEmail(userEmail: string, firstName: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
    
    const emailTemplate: EmailTemplate = {
      to: userEmail,
      from: this.fromEmail,
      subject: 'Verify Your IronLedger MedMap Account',
      html: this.getVerificationEmailTemplate(firstName, verificationUrl),
      text: this.getVerificationEmailText(firstName, verificationUrl)
    };

    try {
      await sgMail.send(emailTemplate);
      console.log(`Verification email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendDoctorApprovalEmail(userEmail: string, firstName: string, lastName: string): Promise<boolean> {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/doctor-portal`;
    
    const emailTemplate: EmailTemplate = {
      to: userEmail,
      from: this.fromEmail,
      subject: 'Your IronLedger MedMap Doctor Account is Approved!',
      html: this.getDoctorApprovalTemplate(firstName, lastName, loginUrl),
      text: this.getDoctorApprovalText(firstName, lastName, loginUrl)
    };

    try {
      await sgMail.send(emailTemplate);
      console.log(`Doctor approval email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending doctor approval email:', error);
      return false;
    }
  }

  private getWelcomeEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to IronLedger MedMap</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-title { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
        .welcome-text { font-size: 16px; color: #475569; margin-bottom: 30px; line-height: 1.8; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .features { background-color: #f1f5f9; padding: 30px; margin: 30px 0; border-radius: 12px; }
        .feature { margin-bottom: 15px; display: flex; align-items: center; }
        .feature-icon { width: 20px; height: 20px; background-color: #0ea5e9; border-radius: 50%; margin-right: 15px; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 IronLedger MedMap</div>
            <div class="tagline">Connecting You with Trusted Healthcare Professionals</div>
        </div>
        
        <div class="content">
            <h1 class="welcome-title">Welcome to IronLedger MedMap, ${firstName}!</h1>
            
            <p class="welcome-text">
                Thank you for joining South Africa's premier healthcare platform. We're excited to help you connect with verified medical professionals across all 9 provinces.
            </p>
            
            <p class="welcome-text">
                To complete your account setup and start booking appointments, please verify your email address:
            </p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="btn">Verify My Email Address</a>
            </div>
            
            <div class="features">
                <h3 style="color: #1e293b; margin-bottom: 20px;">What you can do with IronLedger MedMap:</h3>
                <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Find and book appointments with verified doctors across South Africa</span>
                </div>
                <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Access emergency medical services and contact information</span>
                </div>
                <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Manage your appointments and medical history</span>
                </div>
                <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Choose from virtual or in-person consultations</span>
                </div>
                <div class="feature">
                    <div class="feature-icon"></div>
                    <span>Secure payments with PayFast integration</span>
                </div>
            </div>
            
            <p class="welcome-text">
                If you have any questions or need assistance, our support team is here to help. Welcome to better healthcare access!
            </p>
        </div>
        
        <div class="footer">
            <p><strong>IronLedger MedMap</strong><br>
            Empowering Healthcare Access Across South Africa</p>
            <p style="margin-top: 20px; font-size: 12px;">
                This email was sent to ${firstName} because you signed up for IronLedger MedMap.<br>
                If you didn't create this account, please ignore this email.
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  private getWelcomeEmailText(firstName: string, verificationUrl: string): string {
    return `
Welcome to IronLedger MedMap, ${firstName}!

Thank you for joining South Africa's premier healthcare platform. We're excited to help you connect with verified medical professionals across all 9 provinces.

To complete your account setup and start booking appointments, please verify your email address by clicking this link:
${verificationUrl}

What you can do with IronLedger MedMap:
• Find and book appointments with verified doctors across South Africa
• Access emergency medical services and contact information
• Manage your appointments and medical history
• Choose from virtual or in-person consultations
• Secure payments with PayFast integration

If you have any questions or need assistance, our support team is here to help. Welcome to better healthcare access!

IronLedger MedMap
Empowering Healthcare Access Across South Africa

This email was sent to ${firstName} because you signed up for IronLedger MedMap.
If you didn't create this account, please ignore this email.
`;
  }

  private getDoctorWelcomeTemplate(firstName: string, lastName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doctor Registration - IronLedger MedMap</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; color: #1e293b; margin-bottom: 20px; }
        .text { font-size: 16px; color: #475569; margin-bottom: 20px; line-height: 1.8; }
        .status-box { background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 IronLedger MedMap</div>
            <div>Professional Healthcare Network</div>
        </div>
        
        <div class="content">
            <h1 class="title">Welcome Dr. ${firstName} ${lastName}!</h1>
            
            <p class="text">
                Thank you for your interest in joining IronLedger MedMap's network of verified healthcare professionals. Your registration has been received and is currently under review.
            </p>
            
            <div class="status-box">
                <h3 style="color: #92400e; margin-top: 0;">📋 Application Status: Under Review</h3>
                <p style="color: #92400e; margin-bottom: 0;">
                    Our verification team will review your credentials and contact you within 2-3 business days with your approval status and next steps.
                </p>
            </div>
            
            <p class="text">
                <strong>What happens next:</strong><br>
                1. Our team will verify your medical credentials and HPCSA registration<br>
                2. You'll receive an approval email with login instructions<br>
                3. Access your doctor portal to manage appointments and schedule<br>
                4. Start connecting with patients across South Africa
            </p>
            
            <p class="text">
                If you have any questions about the verification process, please contact our support team.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>IronLedger MedMap</strong><br>
            Professional Healthcare Network</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDoctorWelcomeText(firstName: string, lastName: string): string {
    return `
Welcome Dr. ${firstName} ${lastName}!

Thank you for your interest in joining IronLedger MedMap's network of verified healthcare professionals. Your registration has been received and is currently under review.

APPLICATION STATUS: Under Review
Our verification team will review your credentials and contact you within 2-3 business days with your approval status and next steps.

What happens next:
1. Our team will verify your medical credentials and HPCSA registration
2. You'll receive an approval email with login instructions
3. Access your doctor portal to manage appointments and schedule
4. Start connecting with patients across South Africa

If you have any questions about the verification process, please contact our support team.

IronLedger MedMap
Professional Healthcare Network
`;
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - IronLedger MedMap</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; text-align: center; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 IronLedger MedMap</h1>
            <p>Verify Your Email Address</p>
        </div>
        
        <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <a href="${verificationUrl}" class="btn">Verify Email Address</a>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p>IronLedger MedMap - Empowering Healthcare Access</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getVerificationEmailText(firstName: string, verificationUrl: string): string {
    return `
Hi ${firstName},

Please click the link below to verify your email address and activate your IronLedger MedMap account:

${verificationUrl}

This link will expire in 24 hours. If you didn't create this account, please ignore this email.

IronLedger MedMap - Empowering Healthcare Access
`;
  }

  private getDoctorApprovalTemplate(firstName: string, lastName: string, loginUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved - IronLedger MedMap</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .success-box { background-color: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">🏥 IronLedger MedMap</div>
            <div>Your Account is Approved!</div>
        </div>
        
        <div class="content">
            <div class="success-box">
                <h2 style="color: #065f46; margin-top: 0;">✅ Congratulations Dr. ${firstName} ${lastName}!</h2>
                <p style="color: #065f46; margin-bottom: 0;">
                    Your doctor account has been verified and approved. You can now access your doctor portal.
                </p>
            </div>
            
            <p>Welcome to the IronLedger MedMap professional network! Your credentials have been verified and your account is now active.</p>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="btn">Access Doctor Portal</a>
            </div>
            
            <p><strong>What you can do now:</strong></p>
            <ul>
                <li>Set up your practice schedule and availability</li>
                <li>Manage patient appointments and bookings</li>
                <li>Update your professional profile and consultation fees</li>
                <li>Communicate with patients through the platform</li>
                <li>Track your practice analytics and revenue</li>
            </ul>
            
            <p>If you need assistance getting started, our support team is available to help.</p>
        </div>
        
        <div class="footer">
            <p><strong>IronLedger MedMap</strong><br>
            Professional Healthcare Network</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getDoctorApprovalText(firstName: string, lastName: string, loginUrl: string): string {
    return `
Congratulations Dr. ${firstName} ${lastName}!

Your doctor account has been verified and approved. You can now access your doctor portal.

Welcome to the IronLedger MedMap professional network! Your credentials have been verified and your account is now active.

Access your doctor portal: ${loginUrl}

What you can do now:
• Set up your practice schedule and availability
• Manage patient appointments and bookings
• Update your professional profile and consultation fees
• Communicate with patients through the platform
• Track your practice analytics and revenue

If you need assistance getting started, our support team is available to help.

IronLedger MedMap
Professional Healthcare Network
`;
  }
}

export const emailService = new EmailService();