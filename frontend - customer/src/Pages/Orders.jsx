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

  /* NOT LOGGED IN */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#EFE6D8] px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#3B2A1F] mb-1">
            Please login
          </h2>
          <p className="text-xs text-[#6F4E37]/70">
            Login to view and track your orders
          </p>
        </div>
      </div>
    );
  }

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE6D8] px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6F4E37] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs text-[#6F4E37]/70">Loading your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFE6D8] pb-24">
      <div className="px-3 py-3 sm:px-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg sm:text-xl font-semibold text-[#3B2A1F]">
            Your Orders
          </h1>
          <p className="text-xs text-[#6F4E37]/70 mt-0.5">
            Track your current and past orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
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
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition whitespace-nowrap ${
                filter === f
                  ? "bg-[#6F4E37] text-white shadow"
                  : "bg-[#F6EFE6] text-[#6F4E37] border border-[#6F4E37]/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="rounded-xl bg-[#F6EFE6] p-3 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#6F4E37]/60 mb-0.5">
                    Order ID
                  </div>
                  <div className="text-[11px] font-mono text-[#3B2A1F] break-all">
                    {order._id}
                  </div>
                </div>

                <div
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    order.status === "Pending Payment"
                      ? "bg-[#FDECEC] text-[#B23B3B]"
                      : order.status === "Paid"
                        ? "bg-[#E6F3EA] text-[#2E7D32]"
                        : order.status === "Preparing"
                          ? "bg-[#FFF4E5] text-[#9C6A1B]"
                          : order.status === "Ready"
                            ? "bg-[#EEE8F6] text-[#5A3E85]"
                            : "bg-[#E5D6C5] text-[#6F4E37]"
                  }`}
                >
                  {order.status || "Pending Payment"}
                </div>
              </div>

              {/* Date / ETA */}
              <div className="text-xs text-[#6F4E37]/70 mt-1">
                {formatDate(order.createdAt)}
                {order.eta && (
                  <span className="ml-2">• ETA {order.eta} min</span>
                )}
              </div>

              {/* Item Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto mt-2 pb-1">
                {order.items.slice(0, 4).map((it, i) =>
                  it.image ? (
                    <img
                      key={i}
                      src={it.image}
                      alt={it.name}
                      className="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-lg bg-[#E5D6C5] flex items-center justify-center text-xs text-[#6F4E37]/60"
                    >
                      No Img
                    </div>
                  ),
                )}
                {order.items.length > 4 && (
                  <div className="h-12 w-12 rounded-lg bg-[#EDE1D2] flex items-center justify-center text-xs font-medium text-[#6F4E37]">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              {/* Total + Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 mt-2 border-t border-[#6F4E37]/20">
                <div className="text-base font-semibold text-[#3B2A1F]">
                  ₹{getTotal(order)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                    className="rounded-full border border-[#6F4E37]/30 px-3 py-1 text-xs text-[#6F4E37] hover:bg-[#6F4E37]/10"
                  >
                    {expanded === order._id ? "Hide" : "Details"}
                  </button>

                  {(order.status === "Paid" ||
                    order.status === "Completed") && (
                    <button
                      onClick={() => setShowReceipt(order)}
                      className="rounded-full bg-[#6F4E37] px-3 py-1 text-xs text-white hover:opacity-90"
                    >
                      Receipt
                    </button>
                  )}

                  {order.status === "Pending Payment" && (
                    <button
                      onClick={() =>
                        navigate("/checkout", { state: { order } })
                      }
                      className="rounded-full bg-[#6F4E37] px-3 py-1 text-xs text-white hover:opacity-90"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === order._id && (
                <div className="mt-3 pt-3 border-t border-[#6F4E37]/20 space-y-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {it.image ? (
                        <img
                          src={it.image}
                          alt={it.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-[#E5D6C5] flex items-center justify-center text-xs text-[#6F4E37]/60">
                          No Img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#3B2A1F] truncate">
                          {it.name}
                        </div>
                        <div className="text-xs text-[#6F4E37]/70">
                          Qty: {it.qty} × ₹{it.price}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#3B2A1F]">
                        ₹{it.price * it.qty}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-[#6F4E37]/70 py-12">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm font-medium">No orders found</p>
              <p className="text-xs mt-1">
                {filter === "All"
                  ? "You haven't placed any orders yet"
                  : `No ${filter.toLowerCase()} orders`}
              </p>
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {showReceipt && (
          <Receipt order={showReceipt} onClose={() => setShowReceipt(null)} />
        )}
      </div>
    </div>
  );
}
