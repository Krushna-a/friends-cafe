import React from "react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Refund & Cancellation Policy
        </h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <p className="text-sm text-gray-500 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p>
              At Friends Cafe, we strive to provide the best quality food and
              service. This policy outlines our refund and cancellation
              procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Cancellation Policy
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Before Order Preparation
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Orders can be cancelled within 2 minutes of placement</li>
                  <li>
                    Full refund will be processed to the original payment method
                  </li>
                  <li>Refund processing time: 5-7 business days</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  After Order Preparation Starts
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Orders cannot be cancelled once preparation has begun</li>
                  <li>Status will show as "Preparing" in your orders page</li>
                  <li>
                    Please contact our staff immediately if you need to cancel
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Dine-in Orders (QR Code)
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    Cancellation must be requested before food preparation
                  </li>
                  <li>
                    Speak to our staff at your table for immediate assistance
                  </li>
                  <li>
                    Partial cancellations may be possible for multi-item orders
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Refund Policy
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Eligible for Refund
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Order cancelled within the allowed timeframe</li>
                  <li>Wrong item delivered</li>
                  <li>Food quality issues (must be reported immediately)</li>
                  <li>Payment charged but order not received</li>
                  <li>Duplicate payment for the same order</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Not Eligible for Refund
                </h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Change of mind after order preparation</li>
                  <li>Delay in collecting prepared orders</li>
                  <li>Personal taste preferences</li>
                  <li>Orders consumed partially or fully</li>
                  <li>Cancellation after food is ready</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Refund Process
            </h2>
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                Contact us immediately with your order ID and issue details
              </li>
              <li>Our team will review your request within 24 hours</li>
              <li>
                If approved, refund will be initiated to your original payment
                method
              </li>
              <li>Refund processing time: 5-7 business days</li>
              <li>
                You will receive a confirmation SMS once refund is processed
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Payment Failures
            </h2>
            <p>If payment is deducted but order is not confirmed:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>
                Amount will be automatically refunded within 5-7 business days
              </li>
              <li>Check your order history to confirm order status</li>
              <li>Contact us if amount is not refunded within 7 days</li>
              <li>Keep your transaction ID for reference</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Quality Issues
            </h2>
            <p>If you receive food that doesn't meet our quality standards:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Report the issue immediately to our staff</li>
              <li>We will replace the item or provide a full refund</li>
              <li>Take a photo of the issue for faster resolution</li>
              <li>Quality complaints must be made before consuming the food</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Partial Refunds
            </h2>
            <p>In some cases, we may offer partial refunds for:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Missing items from your order</li>
              <li>Incorrect quantities delivered</li>
              <li>Minor quality issues that don't warrant full refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              How to Request Refund
            </h2>
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">Contact Us:</p>
              <p>Email: krushnaboinwad70@gmail.com</p>
              <p>Phone: 7020330661</p>
              <p className="mt-2 text-sm">
                Please include your Order ID and reason for refund request
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Important Notes
            </h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Refunds are processed only to the original payment method</li>
              <li>We do not provide cash refunds for online payments</li>
              <li>Bank processing times may vary</li>
              <li>Keep your order confirmation for refund requests</li>
              <li>Refund policy is subject to change without prior notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contact Us
            </h2>
            <p>For any questions about our Refund & Cancellation Policy:</p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Friends Cafe</p>
              <p>Email: krushnaboinwad70@gmail.com</p>
              <p>Phone: 7020330661</p>
              <p>Address: Bibwewadi Pune</p>
              <p className="mt-2 text-sm text-gray-600">
                Customer support available: 9 AM - 10 PM (All days)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
