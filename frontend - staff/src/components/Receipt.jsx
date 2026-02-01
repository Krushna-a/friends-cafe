import React, { useRef } from "react";
import { useSettings } from "../hooks/useSettings";

const Receipt = ({ order, user, onClose, showDiscount = false }) => {
  const receiptRef = useRef(null);
  const { settings } = useSettings();

  const getSubtotal = () => {
    if (!order.items) return order.subtotal || order.total || 0;
    return order.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0,
    );
  };

  const getTotal = () => {
    return order.total || getSubtotal();
  };

  const getDiscountAmount = () => {
    return order.discount || 0;
  };

  const handlePrint = () => {
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
      });
    } catch {
      return dateString;
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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div
          ref={receiptRef}
          className="receipt-container bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Receipt Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center border-b pb-4 mb-4">
              {settings.printLogo && settings.logo && (
                <div className="mb-3">
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-16 mx-auto"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold mb-2">{settings.cafeName}</h1>
              <p className="text-base text-gray-700 font-medium">
                {settings.cafeTagline}
              </p>
              {settings.receiptHeader && (
                <p className="text-xs text-gray-600 mt-2 whitespace-pre-line">
                  {settings.receiptHeader}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">Order Receipt</p>
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
              {user && !order.isPosOrder && order.orderType !== "pos" && (
                <>
                  {(user.name || user.userName) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span>{user.name || user.userName || "N/A"}</span>
                    </div>
                  )}
                  {(user.mobile || user.userMobile) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span>{user.mobile || user.userMobile || "N/A"}</span>
                    </div>
                  )}
                </>
              )}
              {(order.isPosOrder || order.orderType === "pos") &&
                order.tableNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-semibold">
                      Table {order.tableNumber}
                    </span>
                  </div>
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
                          {item.qty || 1} x {settings.currencySymbol}
                          {item.price || 0}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {settings.currencySymbol}
                        {((item.price || 0) * (item.qty || 1)).toFixed(2)}
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
              {showDiscount && order.subtotal && (
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {settings.currencySymbol}
                    {(order.subtotal || getSubtotal()).toFixed(2)}
                  </span>
                </div>
              )}
              {showDiscount && getDiscountAmount() > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount (
                    {order.discountType === "percentage"
                      ? "%"
                      : settings.currencySymbol}
                    ):
                  </span>
                  <span>
                    -{settings.currencySymbol}
                    {getDiscountAmount().toFixed(2)}
                  </span>
                </div>
              )}
              {showDiscount && order.taxAmount && order.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Tax ({order.taxRate || settings.defaultTaxRate || 0}%):
                  </span>
                  <span>
                    {settings.currencySymbol}
                    {order.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>
                  {settings.currencySymbol}
                  {getTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4">
              <div className="mb-2 text-gray-700 whitespace-pre-line">
                {settings.receiptFooter}
              </div>
              {settings.address &&
                (settings.address.street || settings.address.city) && (
                  <div className="mb-2 text-gray-600">
                    {settings.address.street && (
                      <div>{settings.address.street}</div>
                    )}
                    {(settings.address.city ||
                      settings.address.state ||
                      settings.address.pincode) && (
                      <div>
                        {[
                          settings.address.city,
                          settings.address.state,
                          settings.address.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                )}
              {(settings.phone || settings.email) && (
                <div className="mb-2 text-gray-600">
                  {settings.phone && <div>Phone: {settings.phone}</div>}
                  {settings.email && <div>Email: {settings.email}</div>}
                </div>
              )}
              {settings.gstNumber && (
                <div className="mb-2 text-gray-600">
                  GST: {settings.gstNumber}
                </div>
              )}
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
