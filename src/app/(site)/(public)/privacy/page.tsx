import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      
      <div className="pt-32 pb-24 px-6 container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-black text-charcoal-blue mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg text-steel-gray max-w-none">
          <p className="text-xl leading-relaxed mb-12">
            At Mobil Garage Door, we prioritize the security of your personal and financial data. 
            This policy outlines how we collect, use, and protect your information, specifically regarding our dispatch and payment systems.
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">1. Information We Collect</h2>
          <p>
            We collect information necessary to provide our garage door repair and installation services, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Identity Data:</strong> Name, phone number, and email address.</li>
            <li><strong>Location Data:</strong> Service address and gate codes/access instructions.</li>
            <li><strong>Financial Data:</strong> Payment card details (processed securely via Square), transaction history, and billing addresses.</li>
            <li><strong>Technical Data:</strong> IP address and browser data when you use our digital booking tools.</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">2. How We Use Your Data</h2>
          <p>
            Your data is used strictly for operational purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Dispatching:</strong> Assigning technicians to your specific location efficiently.</li>
            <li><strong>Communication:</strong> Sending real-time updates about technician arrival and job status.</li>
            <li><strong>Billing:</strong> Processing payments, issuing refunds, and generating invoices.</li>
            <li><strong>Customer Service:</strong> maintaining a history of your repairs for warranty and support.</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">3. Third-Party Data Sharing</h2>
          <p>
            We do not sell your data. We share data only with trusted infrastructure partners required to operate our business:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8">
            <li><strong>Square (Block, Inc.):</strong> For secure payment processing and customer profile management. When you pay us, your transaction data is stored in Square's secure vault.</li>
            <li><strong>Google Maps Platform:</strong> To validate addresses and route technicians.</li>
            <li><strong>Twilio / SendGrid:</strong> For transactional SMS and email notifications.</li>
          </ul>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">4. Data Security</h2>
          <p className="mb-8">
            We employ industry-standard encryption (TLS/SSL) for data in transit. We do not store full credit card numbers on our own servers; 
            all sensitive financial data is tokenized and handled directly by Square's PCI-compliant infrastructure.
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">5. Your Rights</h2>
          <p className="mb-8">
            You have the right to request access to the personal data we hold about you, or to request its deletion (subject to legal record-keeping requirements). 
            To exercise these rights, please contact our support team.
          </p>

          <h2 className="text-2xl font-bold text-charcoal-blue mt-12 mb-6">6. Updates to This Policy</h2>
          <p className="mb-8">
            We may update this privacy policy from time to time. The latest version will always be available on this page.
            <br />
            <strong>Last Updated:</strong> February 14, 2026
          </p>

          <div className="bg-gray-50 p-8 rounded-2xl mt-12 border border-gray-100">
            <h3 className="text-lg font-bold text-charcoal-blue mb-2">Contact Us</h3>
            <p>
              If you have questions about this policy, please email us at <a href="mailto:privacy@mobilegaragedoor.com" className="text-golden-yellow font-bold hover:underline">privacy@mobilegaragedoor.com</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
