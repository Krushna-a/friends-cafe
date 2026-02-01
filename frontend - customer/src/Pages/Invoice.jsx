import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Invoice() {
  const { orderId } = useParams();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("fcc_token");
      if (!token) {
        setError("Please login to view invoice");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          const foundOrder = data.orders.find((o) => o._id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            setError("Invoice not found");
          }
        } else {
          setError("Failed to fetch invoice");
        }
      } catch (err) {
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateString) => {
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

  const getTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            to="/orders"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <p className="text-gray-500 mb-4">
            The requested invoice could not be found.
          </p>
          <Link
            to="/orders"
            className="text-orange-500 hover:text-orange-600 font-medium"
          >
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="text-center border-b pb-4 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
              <span className="text-2xl font-bold text-orange-600">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Friends Club Cafe
            </h1>
            <p className="text-sm text-gray-600 font-medium">Invoice</p>
            <div className="mt-3 inline-block px-3 py-1 bg-green-100 rounded-full">
              <p className="text-xs font-semibold text-green-700">
                ✓ Payment Successful
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-600">Invoice ID:</span>
              <div className="font-semibold">{order._id}</div>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <div className="font-semibold">{formatDate(order.createdAt)}</div>
            </div>
            {user?.name && (
              <div>
                <span className="text-gray-600">Customer:</span>
                <div className="font-semibold">{user.name}</div>
              </div>
            )}
            {user?.mobile && (
              <div>
                <span className="text-gray-600">Mobile:</span>
                <div className="font-semibold">{user.mobile}</div>
              </div>
            )}
            <div>
              <span className="text-gray-600">Status:</span>
              <div className="font-semibold text-green-600">{order.status}</div>
            </div>
            {order.tableNumber && (
              <div>
                <span className="text-gray-600">Table:</span>
                <div className="font-semibold">{order.tableNumber}</div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.name || item.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.qty || 1} x ₹{item.price || 0}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-2">No items</div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-bold border-t pt-4">
            <span>Total Amount:</span>
            <span>₹{getTotal().toFixed(2)}</span>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t pt-4 mt-6">
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
              <p>This is a computer-generated invoice</p>
              <p>Friends Club Cafe - Scan • Order • Enjoy</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/orders"
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium text-center transition"
          >
            Back to Orders
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 font-medium transition"
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
