import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p>
              Friends Cafe ("we," "our," or "us") is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              restaurant ordering service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">
                  Personal Information
                </h3>
                <p>
                  We collect information that you provide directly to us,
                  including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Name and mobile number for account creation</li>
                  <li>Order history and preferences</li>
                  <li>
                    Payment information (processed securely through
                    Razorpay/PayU)
                  </li>
                  <li>Table number when ordering via QR code</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Usage Information</h3>
                <p>
                  We automatically collect certain information about your device
                  and usage patterns:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Device type and browser information</li>
                  <li>IP address and location data</li>
                  <li>Order timestamps and frequency</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How We Use Your Information
            </h2>
            <p>We use the collected information for:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Processing and fulfilling your orders</li>
              <li>Sending SMS OTP for authentication</li>
              <li>Providing customer support</li>
              <li>Improving our services and menu offerings</li>
              <li>Sending order confirmations and receipts</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                <strong>Payment Processors:</strong> Razorpay/PayU for secure
                payment processing
              </li>
              <li>
                <strong>SMS Service:</strong> Twilio for OTP delivery
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Cookies
            </h2>
            <p>
              We use cookies and similar technologies to enhance your
              experience, analyze usage, and remember your preferences. You can
              control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Children's Privacy
            </h2>
            <p>
              Our service is not intended for children under 13. We do not
              knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Friends Cafe</p>
              <p>Email: krushnaboinwad70@gmail.com</p>
              <p>Phone: +91-7020330661</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
