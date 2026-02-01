import React, { useRef } from "react";
import { useUser } from "../context/UserContext";

const Receipt = ({ order, onClose }) => {
  const receiptRef = useRef(null);
  const { user } = useUser();

  const getTotal = () => {
    if (!order.items) return 0;
    // First try to use the total from the database
    if (order.finalAmount) return order.finalAmount;
    if (order.total) return order.total;

    // Fallback to calculating from items (handle both qty and quantity)
    return order.items.reduce((sum, item) => {
      const quantity = item.quantity || item.qty || 1;
      const price = item.price || 0;
      return sum + price * quantity;
    }, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateString;
    }
  };

  // Only show receipt if payment is done
  if (order.status !== "Paid" && order.status !== "Completed") {
    return null;
  }

  // Handle click outside to close receipt
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5cm;
            size: A4;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div
          ref={receiptRef}
          className="receipt-container bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Receipt Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                <span className="text-2xl font-bold text-orange-600">F</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Friends Cafe
              </h1>
              <p className="text-sm text-gray-600 font-medium">Coffee & More</p>
              <div className="mt-3 inline-block px-3 py-1 bg-green-100 rounded-full">
                <p className="text-xs font-semibold text-green-700">
                  ✓ Payment Successful
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              {user && (
                <>
                  {user.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span>{user.name}</span>
                    </div>
                  )}
                  {user.mobile && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span>{user.mobile}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Items */}
            <div className="border-t border-b py-4 my-4">
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.name || item.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity || item.qty || 1} x ₹{item.price || 0}
                        </div>
                      </div>
                      <div className="font-semibold">
                        ₹
                        {(
                          (item.price || 0) * (item.quantity || item.qty || 1)
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-2">No items</div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4">
              <p className="mb-1 font-medium text-gray-700">
                Thank you for your business!
              </p>
              <p className="mb-2">Visit us again soon</p>
              {order.eta && (
                <p className="mt-2 text-gray-600 font-medium">
                  Estimated Delivery: {order.eta} minutes
                </p>
              )}
              <div className="mt-4 pt-3 border-t text-xs text-gray-400">
                <p>This is a computer-generated receipt</p>
                <p>No signature required</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print p-4 border-t flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
