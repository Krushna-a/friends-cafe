import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import Receipt from "../Components/Receipt";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const STATUS_STYLES = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-amber-100 text-amber-700 border-amber-200",
  ready: "bg-purple-100 text-purple-700 border-purple-200",
  served: "bg-teal-100 text-teal-700 border-teal-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  "pending payment": "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

const FILTERS = ["All", "confirmed", "preparing", "ready", "paid", "cancelled"];

const statusLabel = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";

export default function Orders() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productMap, setProductMap] = useState({});

  const navigate = useNavigate();
  const { user, setShowAuth } = useUser();
  const { orders: contextOrders, setOrders } = useCart();
  const [orders, setLocalOrders] = useState(contextOrders || []);

  useEffect(() => {
    if (!user) setShowAuth(true);
  }, [user, setShowAuth]);

  // Build product image map
  const fetchProductMap = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/products`);
      const j = await r.json();
      if (r.ok && j.products) {
        const map = {};
        j.products.forEach((p) => {
          if (p._id) map[p._id] = p.image || null;
          if (p.name) map[p.name.toLowerCase()] = p.image || null;
        });
        setProductMap(map);
      }
    } catch {}
  };

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
    fetchProductMap();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const getItemImage = (item) => {
    if (item.productId) {
      const img =
        productMap[item.productId] || productMap[String(item.productId)];
      if (img) return img;
    }
    return productMap[(item.name || "").toLowerCase()] || null;
  };

  const filtered =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  if (!user) {
    return (
      <div className="min-h-screen bg-soft-cream flex items-center justify-center">
        <div className="text-muted-brown text-sm">
          Please login to view orders
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-coffee-brown/20 border-t-coffee-brown" />
          <span className="text-muted-brown text-sm">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cream pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-cocoa">My Orders</h2>
            <p className="text-sm text-muted-brown mt-1">
              {orders.length} total · auto-refreshes every 5s
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchOrders();
            }}
            className="bg-caramel-orange text-white py-2.5 px-5 rounded-xl hover:bg-dark-cocoa transition-all font-semibold shadow flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filter === f
                  ? "bg-dark-cocoa text-white border-dark-cocoa"
                  : "bg-white text-muted-brown border-beige hover:border-coffee-brown"
              }`}
            >
              {f === "All" ? "All" : statusLabel(f)}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-beige">
            <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-muted-brown"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-dark-cocoa font-semibold">No orders found</p>
            <p className="text-muted-brown text-sm mt-1">
              Orders will appear here once placed
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-beige shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3 bg-beige/50 border-b border-beige">
                  <div>
                    <span className="font-mono text-xs text-muted-brown">
                      #{order._id?.slice(-8)}
                    </span>
                    {order.orderNumber && (
                      <span className="ml-2 text-xs text-coffee-brown font-semibold">
                        {order.orderNumber}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-beige/60">
                  {order.tableNumber && (
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M3 14h18"
                        />
                      </svg>
                      Table {order.tableNumber}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-brown">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>

                {/* Item image strip */}
                {order.items?.length > 0 && (
                  <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                    {order.items.map((item, idx) => {
                      const img = getItemImage(item);
                      return (
                        <div
                          key={idx}
                          className="flex-shrink-0 flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-beige border border-beige flex items-center justify-center">
                            {img ? (
                              <img
                                src={img}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center text-muted-brown"
                              style={{ display: img ? "none" : "flex" }}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-brown text-center w-12 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-semibold text-coffee-brown">
                            ×{item.quantity || item.qty || 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expandable detail */}
                {expanded === order._id && (
                  <div className="px-4 pb-3 space-y-1.5 border-t border-beige/60 pt-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-dark-espresso font-medium">
                          {item.name}
                        </span>
                        <span className="text-muted-brown">
                          {item.quantity || item.qty || 1} × ₹{item.price} ={" "}
                          <span className="text-coffee-brown font-semibold">
                            ₹
                            {item.itemTotal ||
                              item.price * (item.quantity || item.qty || 1)}
                          </span>
                        </span>
                      </div>
                    ))}
                    {order.totalDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>Discount</span>
                        <span>-₹{order.totalDiscount}</span>
                      </div>
                    )}
                    {order.totalTax > 0 && (
                      <div className="flex justify-between text-sm text-muted-brown">
                        <span>Tax</span>
                        <span>₹{order.totalTax}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-beige bg-beige/30">
                  <span className="text-xl font-bold text-coffee-brown">
                    ₹{order.finalAmount || order.total || 0}
                  </span>
                  <div className="flex gap-2">
                    {/* Pay Now for pending orders */}
                    {(order.status === "confirmed" ||
                      order.status?.toLowerCase() === "pending payment") && (
                      <button
                        onClick={() =>
                          navigate("/checkout", { state: { order } })
                        }
                        className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
                      >
                        Pay Now
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setExpanded(expanded === order._id ? null : order._id)
                      }
                      className="text-xs border border-beige bg-white text-muted-brown px-3 py-1.5 rounded-lg hover:border-coffee-brown transition-colors"
                    >
                      {expanded === order._id ? "Less" : "Details"}
                    </button>
                    <button
                      onClick={() =>
                        setShowReceipt({
                          order,
                          user: { name: user?.name, mobile: user?.mobile },
                        })
                      }
                      className="text-xs bg-caramel-orange text-white px-3 py-1.5 rounded-lg hover:bg-dark-cocoa transition-colors font-semibold"
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReceipt && (
        <Receipt
          order={showReceipt.order}
          user={showReceipt.user}
          onClose={() => setShowReceipt(null)}
        />
      )}
    </div>
  );
}
