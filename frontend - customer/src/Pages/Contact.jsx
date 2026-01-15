import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-700 mb-6">
                We'd love to hear from you! Whether you have a question about
                our menu, need assistance with an order, or just want to share
                feedback, our team is here to help.
              </p>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              {/* Address */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                  <p className="text-gray-700">
                    Friends Cafe
                    <br />
                    Bhagyanagari Society
                    <br />
                    Bibwewadi Pune 411037
                    <br />
                    India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Phone className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                  <p className="text-gray-700">
                    Phone: +91-7020330661
                    <br />
                    <span className="text-sm text-gray-500">
                      Available 9 AM - 10 PM
                    </span>
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-700">
                    General: krushnaboinwad70@gmail.com
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Opening Hours
                  </h3>
                  <p className="text-gray-700">
                    Monday - Friday: 8 AM - 10 PM
                    <br />
                    Saturday - Sunday: 8 AM - 11 PM
                    <br />
                    <span className="text-sm text-orange-600 font-medium">
                      Open all days
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Links
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/menu"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  View Menu
                </a>
                <a
                  href="/orders"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  My Orders
                </a>
                <a
                  href="/privacy-policy"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms-conditions"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Terms & Conditions
                </a>
              </div>
            </section>

            <section className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">
                Need Immediate Assistance?
              </h3>
              <p className="text-orange-800">
                For urgent order-related queries, please call us directly at{" "}
                <strong>+91-7020330661</strong>
                or speak to our staff if you're dining in.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
