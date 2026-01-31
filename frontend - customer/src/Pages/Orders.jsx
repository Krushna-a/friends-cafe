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
  const [showPaymentMode, setShowPaymentMode] = useState(null);
  const [paymentMode, setPaymentMode] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user, setShowAuth } = useUser();
  const { orders: contextOrders, setOrders } = useCart();
  const [orders, setLocalOrders] = useState(contextOrders || []);

  /* ================= LOGIN CHECK ================= */
  useEffect(() => {
    if (!user) {
      setShowAuth(true);
    }
  }, [user, setShowAuth]);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async () => {
    const token = localStorage.getItem("fcc_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();

      if (r.ok) {
        setLocalOrders(j.orders || []);
        setOrders(j.orders || []);
      }
    } catch (e) {
      console.warn("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  /* ================= HELPERS ================= */
  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const getTotal = (order) => {
    if (order.finalAmount) return order.finalAmount;
    if (order.total) return order.total;

    return order.items.reduce((s, it) => {
      const qty = it.qty || it.quantity || 1;
      return s + it.price * qty;
    }, 0);
  };

  /* ================= UI STATES ================= */
  if (!user) {
    return (
      <div className="min-h-screen bg-[#EFE6D8] flex items-center justify-center">
        <div className="text-[#6F4E37] text-sm">Please login</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFE6D8] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#6F4E37] border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ================= MAIN UI ================= */
  return (
    <div className="min-h-screen bg-[#EFE6D8] pb-24">
      <div className="px-3 max-w-7xl mx-auto">
        {/* FILTERS */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
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
              className={`px-3 py-1 text-xs rounded-full ${
                filter === f
                  ? "bg-[#6F4E37] text-white"
                  : "border border-[#6F4E37]/30 text-[#6F4E37]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="bg-[#F6EFE6] p-3 rounded-xl shadow-sm"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-[#6F4E37]/60">Order ID</div>
                  <div className="text-[11px] font-mono text-[#3B2A1F]">
                    {order._id}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[#3B2A1F]">
                  ₹{getTotal(order)}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() =>
                    setExpanded(expanded === order._id ? null : order._id)
                  }
                  className="text-xs border px-3 py-1 rounded-full text-[#6F4E37]"
                >
                  {expanded === order._id ? "Hide" : "Details"}
                </button>

                {(order.status === "Paid" ||
                  order.status === "Completed") && (
                  <button
                    onClick={() => {
                      setShowPaymentMode(order);
                      setPaymentMode("");
                    }}
                    className="text-xs bg-[#6F4E37] text-white px-3 py-1 rounded-full"
                  >
                    Print Bill
                  </button>
                )}

                {order.status === "Pending Payment" && (
                  <button
                    onClick={() =>
                      navigate("/checkout", { state: { order } })
                    }
                    className="text-xs bg-[#6F4E37] text-white px-3 py-1 rounded-full"
                  >
                    Pay Now
                  </button>
                )}
              </div>

              {/* EXPANDED ITEMS */}
              {expanded === order._id && (
                <div className="mt-3 pt-3 border-t border-[#6F4E37]/20 space-y-2">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {it.name} × {it.qty || it.quantity || 1}
                      </span>
                      <span>
                        ₹{it.price * (it.qty || it.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PAYMENT MODE MODAL */}
      {showPaymentMode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#F6EFE6] rounded-2xl p-5 w-full max-w-sm">
            <h3 className="font-semibold text-[#3B2A1F] mb-3">
              Select Payment Mode
            </h3>

            {["Cash", "UPI", "Card"].map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`w-full mb-2 px-4 py-3 rounded-xl text-sm ${
                  paymentMode === mode
                    ? "bg-[#6F4E37] text-white"
                    : "bg-white border border-[#6F4E37]/30 text-[#6F4E37]"
                }`}
              >
                {mode}
              </button>
            ))}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPaymentMode(null)}
                className="flex-1 border rounded-xl py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!paymentMode}
                onClick={() => {
                  setShowReceipt({
                    ...showPaymentMode,
                    paymentMode,
                  });
                  setShowPaymentMode(null);
                }}
                className="flex-1 bg-[#6F4E37] text-white rounded-xl py-2 text-sm disabled:opacity-40"
              >
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT */}
      {showReceipt && (
        <Receipt
          order={showReceipt}
          paymentMode={showReceipt.paymentMode}
          onClose={() => setShowReceipt(null)}
        />
      )}
    </div>
  );
}
