import React from "react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Terms and Conditions
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p>
              Welcome to Friends Cafe. By accessing and using our online
              ordering service, you agree to be bound by these Terms and
              Conditions. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By using our service, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
              If you do not agree, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2. Service Description
            </h2>
            <p>
              Friends Cafe provides an online platform for ordering food and
              beverages. We reserve the right to modify, suspend, or discontinue
              any part of our service at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3. User Account
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                You must provide accurate and complete information during
                registration
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                account
              </li>
              <li>You must be at least 13 years old to use our service</li>
              <li>One account per mobile number is allowed</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4. Orders and Payments
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>All orders are subject to availability and acceptance</li>
              <li>Prices are subject to change without notice</li>
              <li>Payment must be completed before order processing</li>
              <li>We accept payments through Razorpay payment gateway</li>
              <li>
                All prices are in Indian Rupees (INR) and include applicable
                taxes
              </li>
              <li>We reserve the right to refuse or cancel any order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5. Order Modifications
            </h2>
            <p>
              Once an order is placed and payment is confirmed, modifications
              may not be possible. Please review your order carefully before
              completing payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6. Delivery and Pickup
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                Estimated preparation times are approximate and not guaranteed
              </li>
              <li>
                Orders placed via QR code are for dine-in service at the
                specified table
              </li>
              <li>We are not responsible for delays beyond our control</li>
              <li>You must collect your order within a reasonable time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7. Prohibited Activities
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Use automated systems to access the service</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, abuse, or harm other users or staff</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8. Intellectual Property
            </h2>
            <p>
              All content on our platform, including text, graphics, logos, and
              images, is the property of Friends Cafe and protected by copyright
              laws. You may not use, reproduce, or distribute any content
              without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Friends Cafe shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of our service. Our total liability
              shall not exceed the amount paid for your order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10. Food Allergies and Dietary Requirements
            </h2>
            <p>
              While we make efforts to accommodate dietary requirements, we
              cannot guarantee that our products are free from allergens. Please
              inform our staff of any allergies or dietary restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              11. Governing Law
            </h2>
            <p>
              These Terms and Conditions are governed by the laws of India. Any
              disputes shall be subject to the exclusive jurisdiction of the
              courts in [Your City], India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              12. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any
              time. Changes will be effective immediately upon posting. Your
              continued use of the service constitutes acceptance of the
              modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              13. Contact Information
            </h2>
            <p>
              For questions about these Terms and Conditions, please contact us
              at:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Friends Cafe</p>
              <p>Email: krushnaboinwad70@gmail.com</p>
              <p>Phone: 7020330661</p>
              <p>Address: Bibwewadi Pune</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
