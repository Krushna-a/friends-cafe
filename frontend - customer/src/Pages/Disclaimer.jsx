import React from "react";

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Disclaimer</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p>
              The information provided by Friends Cafe on our website and mobile
              application is for general informational purposes only. All
              information is provided in good faith, however, we make no
              representation or warranty of any kind, express or implied,
              regarding the accuracy, adequacy, validity, reliability,
              availability, or completeness of any information on the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              General Disclaimer
            </h2>
            <p>
              Under no circumstance shall we have any liability to you for any
              loss or damage of any kind incurred as a result of the use of our
              service or reliance on any information provided on the platform.
              Your use of our service and your reliance on any information is
              solely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Food Allergies and Dietary Information
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="font-medium text-yellow-800">⚠️ Important Notice</p>
              <p className="text-yellow-700 mt-2">
                Our kitchen handles various ingredients including nuts, dairy,
                gluten, and other common allergens. While we take precautions,
                we cannot guarantee that any menu item is completely free from
                allergens.
              </p>
            </div>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Menu descriptions are for general guidance only</li>
              <li>Nutritional information provided is approximate</li>
              <li>Ingredients and recipes may change without notice</li>
              <li>Cross-contamination may occur during food preparation</li>
              <li>
                Always inform our staff of any allergies or dietary restrictions
              </li>
              <li>
                We are not liable for allergic reactions or dietary issues
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Product Images and Descriptions
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Product images are for illustration purposes only</li>
              <li>Actual products may vary in appearance</li>
              <li>Colors and presentation may differ from images</li>
              <li>Portion sizes are approximate</li>
              <li>Garnishes and accompaniments may vary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Pricing and Availability
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Prices are subject to change without notice</li>
              <li>Menu items are subject to availability</li>
              <li>We reserve the right to modify or discontinue items</li>
              <li>Promotional offers may have specific terms and conditions</li>
              <li>Taxes and charges are as per current regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Service Availability
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                Service may be interrupted for maintenance or technical issues
              </li>
              <li>We do not guarantee uninterrupted access to our platform</li>
              <li>Order processing times are estimates and not guaranteed</li>
              <li>
                Service hours may change during holidays or special events
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Third-Party Services
            </h2>
            <p>Our platform uses third-party services including:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-2">
              <li>
                <strong>Payment Gateway:</strong> Razorpay - We are not
                responsible for payment processing issues
              </li>
              <li>
                <strong>SMS Service:</strong> Twilio - We are not liable for SMS
                delivery failures
              </li>
              <li>
                <strong>Cloud Storage:</strong> Cloudinary - Image availability
                depends on third-party service
              </li>
            </ul>
            <p className="mt-3">
              We are not responsible for the privacy practices or content of
              these third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Health and Safety
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>We follow food safety standards and regulations</li>
              <li>
                However, we cannot guarantee absolute safety from foodborne
                illness
              </li>
              <li>Customers consume food at their own risk</li>
              <li>Report any health concerns immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              User-Generated Content
            </h2>
            <p>
              Any reviews, ratings, or feedback provided by users represent
              their personal opinions and do not reflect the views of Friends Cafe. We are not responsible for user-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Technical Accuracy
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>We strive to keep information accurate and up-to-date</li>
              <li>Technical errors or omissions may occur</li>
              <li>We reserve the right to correct errors without notice</li>
              <li>Information may become outdated</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              External Links
            </h2>
            <p>
              Our platform may contain links to external websites. We have no
              control over and assume no responsibility for the content, privacy
              policies, or practices of any third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, Friends cafe shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of
              data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Your use or inability to use our service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of transmission</li>
              <li>
                Any bugs, viruses, or malware transmitted through our service
              </li>
              <li>Any errors or omissions in any content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Professional Advice Disclaimer
            </h2>
            <p>
              The information provided on our platform is not intended as
              medical, nutritional, or professional advice. Always seek the
              advice of qualified professionals regarding any health or dietary
              concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Changes to Disclaimer
            </h2>
            <p>
              We reserve the right to modify this disclaimer at any time.
              Changes will be effective immediately upon posting. Your continued
              use of our service constitutes acceptance of the modified
              disclaimer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Information
            </h2>
            <p>
              If you have any questions about this Disclaimer, please contact
              us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Friends Cafe</p>
              <p>Email: krushnaboinwad70@gmail.com</p>
              <p>Phone: 7020330661</p>
              <p>Address: Bibwewadi Pune</p>
            </div>
          </section>

          <section className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 italic">
              By using our service, you acknowledge that you have read this
              disclaimer and agree to all its terms and conditions. If you do
              not agree with any part of this disclaimer, you must not use our
              service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
