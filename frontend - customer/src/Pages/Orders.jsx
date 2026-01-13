import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import Receipt from "../Components/Receipt";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Orders() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, setShowAuth } = useUser();
  const { orders: contextOrders, setOrders } = useCart();
  const [orders, setLocalOrders] = useState(contextOrders || []);

  // If not logged in, prompt login
  useEffect(() => {
    if (!user) {
      setShowAuth(true);
    }
  }, [user, setShowAuth]);

  // Fetch orders from backend
  const fetchOrders = async () => {
    const token = localStorage.getItem("fcc_token");
    if (!token) {
      setLocalOrders([]);
      setLoading(false);
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (r.ok) {
        const backendOrders = j.orders || [];
        setLocalOrders(backendOrders);
        setOrders(backendOrders);
      }
    } catch (e) {
      console.warn("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when user is available
  useEffect(() => {
    const token = localStorage.getItem("fcc_token");
    if (!token || !user) {
      setLocalOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Sync with context
  useEffect(() => {
    if (contextOrders) setLocalOrders(contextOrders);
  }, [contextOrders]);

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const getTotal = (order) =>
    order.items.reduce((s, it) => s + it.price * it.qty, 0);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please login</h2>
          <p className="text-gray-500 mb-6">
            Login to view and track your orders.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-3 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-xl font-semibold text-gray-900">Your Orders</h1>
        <p className="text-lg text-gray-500">
          Track your current and past orders.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {[
          "All",
          "Pending Payment",
          "Paid",
          "Preparing",
          "Ready",
          "Completed",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === f
                ? "bg-orange-500 text-white shadow"
                : "bg-white border text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.map((order) => (
          <div
            key={order._id}
            className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-gray-900">
                    {order._id}
                  </div>
                  <div
                    className={`text-sm px-3 py-1 rounded-full font-semibold ${
                      order.status === "Pending Payment"
                        ? "bg-red-100 text-red-700"
                        : order.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Preparing"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "Ready"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status || "Pending Payment"}
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                  {order.eta && (
                    <span className="ml-2">• ETA {order.eta} min</span>
                  )}
                </div>

                {/* Item Thumbnails */}
                <div className="mt-3 flex items-center gap-2">
                  {order.items.slice(0, 3).map((it, i) =>
                    it.image ? (
                      <img
                        key={i}
                        src={it.image}
                        alt={it.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        key={i}
                        className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm"
                      >
                        No Img
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-lg font-semibold text-gray-900">
                  ₹ {getTotal(order)}.00
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                    className="rounded-lg border px-3 py-1 text-sm font-medium hover:bg-gray-100"
                  >
                    Details
                  </button>

                  {(order.status === "Paid" ||
                    order.status === "Completed") && (
                    <button
                      onClick={() => setShowReceipt(order)}
                      className="rounded-lg bg-blue-500 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-600 transition"
                    >
                      Receipt
                    </button>
                  )}

                  {order.status === "Pending Payment" && (
                    <button
                      onClick={() =>
                        navigate("/checkout", { state: { order } })
                      }
                      className="rounded-lg bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 transition"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expanded === order._id && (
              <div className="mt-4 border-t pt-4">
                <div className="space-y-3">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                            No Img
                          </div>
                        )}
                        <div>
                          <div className="text-lg font-medium">{it.name}</div>
                          <div className="text-sm text-gray-500">
                            Qty: {it.qty}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-medium">
                        ₹ {it.price * it.qty}.00
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-lg text-gray-600">Total</div>
                    <div className="text-lg font-semibold">
                      ₹ {getTotal(order)}.00
                    </div>
                  </div>

                  {(order.status === "Paid" ||
                    order.status === "Completed") && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => setShowReceipt(order)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-medium transition"
                      >
                        View Receipt
                      </button>
                    </div>
                  )}

                  {order.status === "Pending Payment" && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() =>
                          navigate("/checkout", { state: { order } })
                        }
                        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 font-medium transition"
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No orders found.
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Receipt order={showReceipt} onClose={() => setShowReceipt(null)} />
      )}
    </div>
  );
}
