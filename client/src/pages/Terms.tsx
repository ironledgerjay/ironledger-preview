import BackButton from "@/components/BackButton";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export default function Terms() {
  useActivityLogger('terms');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-6">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              Terms and Conditions
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  By accessing and using IronLedger MedMap ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  2. Medical Disclaimer
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  IronLedger MedMap is a platform that connects patients with medical professionals in South Africa. We do not provide medical advice, diagnosis, or treatment. All medical consultations and treatments are provided by independent healthcare professionals registered with the Health Professions Council of South Africa (HPCSA).
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  <strong>Important:</strong> In case of medical emergencies, contact emergency services immediately (10177) or visit your nearest emergency room.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  3. User Accounts and Registration
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  To use certain features of the Platform, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  4. Healthcare Professional Verification
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  All healthcare professionals on our platform must be registered with the HPCSA and undergo verification. We verify:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Valid HPCSA registration and practice numbers</li>
                  <li>Current professional qualifications</li>
                  <li>Good standing with regulatory bodies</li>
                  <li>Professional indemnity insurance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  5. Payment Terms
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our platform offers two membership tiers:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li><strong>Basic (Free):</strong> R10 booking fee per appointment</li>
                  <li><strong>Premium (R39/quarter):</strong> Unlimited free bookings</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Payments are processed securely through PayFast. Consultation fees are paid directly to healthcare providers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  6. Privacy and Data Protection
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We are committed to protecting your privacy and comply with the Protection of Personal Information Act (POPIA). Please review our Privacy Policy for detailed information about how we collect, use, and protect your personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  7. Prohibited Uses
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You may not use our Platform to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Violate any laws or regulations</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Share inappropriate or offensive content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  IronLedger MedMap acts as a platform connecting patients with healthcare providers. We are not liable for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                  <li>Medical advice, diagnosis, or treatment provided by healthcare professionals</li>
                  <li>Outcomes of medical consultations or procedures</li>
                  <li>Disputes between patients and healthcare providers</li>
                  <li>Technical issues or service interruptions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  9. Governing Law
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  These terms are governed by the laws of South Africa. Any disputes will be resolved in South African courts.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For questions about these terms, please contact us at:
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Email: legal@ironledgermedmap.co.za<br />
                  Phone: +27 11 123 4567<br />
                  Address: 123 Medical Plaza, Johannesburg, South Africa
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}