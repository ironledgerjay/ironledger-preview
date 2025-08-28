import BackButton from "@/components/BackButton";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export default function Privacy() {
  useActivityLogger('privacy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-6">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              Privacy Policy
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  IronLedger MedMap ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform. We comply with the Protection of Personal Information Act (POPIA) and other applicable South African privacy laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  2. Information We Collect
                </h2>
                
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and gender</li>
                  <li>Physical address and location data</li>
                  <li>Medical aid information and membership numbers</li>
                  <li>Emergency contact information</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Healthcare Information
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Medical history and current conditions</li>
                  <li>Medication information and allergies</li>
                  <li>Appointment details and consultation notes</li>
                  <li>Treatment preferences and medical needs</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Technical Information
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Usage patterns and platform interactions</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li><strong>Healthcare Services:</strong> Facilitate appointments and consultations</li>
                  <li><strong>Platform Improvement:</strong> Enhance user experience and functionality</li>
                  <li><strong>Communication:</strong> Send appointment reminders and important updates</li>
                  <li><strong>Payment Processing:</strong> Handle membership fees and consultation payments</li>
                  <li><strong>Compliance:</strong> Meet regulatory and legal requirements</li>
                  <li><strong>Emergency Situations:</strong> Contact emergency services when necessary</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may share your information with:
                </p>
                
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Healthcare Providers
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We share relevant medical information with healthcare professionals you choose to consult for treatment purposes.
                </p>

                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Service Providers
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Payment processors (PayFast) for secure transactions</li>
                  <li>Cloud service providers for data storage</li>
                  <li>Communication services for appointment reminders</li>
                  <li>Analytics providers for platform improvement</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Legal Requirements
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may disclose information when required by law, court order, or to protect rights, property, or safety.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  5. Data Security
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>End-to-end encryption for sensitive data transmission</li>
                  <li>Secure cloud storage with regular backups</li>
                  <li>Multi-factor authentication for healthcare providers</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and employee training</li>
                  <li>HIPAA-compliant data handling procedures</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  6. Your Rights Under POPIA
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Under the Protection of Personal Information Act, you have the right to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request removal of your personal data</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We retain your information for as long as necessary to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Provide healthcare services and maintain medical records</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Improve our services and platform functionality</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Medical records are typically retained for 7 years as per South African healthcare regulations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  8. Cookies and Tracking
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Remember your preferences and login status</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and features</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can control cookies through your browser settings, but this may affect platform functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  9. Children's Privacy
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our platform is designed for users 18 years and older. For minors, we require parental or guardian consent and involvement in all healthcare decisions and data processing activities.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your data is primarily stored and processed in South Africa. If we transfer data internationally, we ensure adequate protection through appropriate safeguards and compliance with POPIA requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  11. Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For privacy-related questions or to exercise your rights, contact our Data Protection Officer:
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Email: privacy@ironledgermedmap.co.za<br />
                  Phone: +27 11 123 4567<br />
                  Address: 123 Medical Plaza, Johannesburg, South Africa<br />
                  <br />
                  For complaints about our handling of personal information, you may also contact the Information Regulator of South Africa.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}