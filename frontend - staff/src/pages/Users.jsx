import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import Receipt from "../components/Receipt";

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);

  // Check if we need to expand a specific user from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    if (userId) {
      setExpandedUser(userId);
      // Scroll to user after a short delay
      setTimeout(() => {
        const element = document.getElementById(`user-${userId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [location.search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending Payment":
        return "bg-yellow-100 text-yellow-800";
      case "Preparing":
        return "bg-blue-100 text-blue-800";
      case "Ready":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-soft-cream p-4 mt-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-coffee-brown/30 border-t-coffee-brown mx-auto mb-4"></div>
          <div className="text-muted-brown font-medium">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-soft-cream p-4 mt-2 w-full overflow-y-auto">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-cocoa">All Customers</h2>
            <p className="text-sm text-muted-brown mt-1">Manage customer information and order history</p>
          </div>
          <button
            onClick={fetchUsers}
            className="bg-caramel-orange text-white py-3 px-6 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="bg-clean-white rounded-2xl shadow-lg border border-beige p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark-cocoa mb-2">No customers found</h3>
              <p className="text-muted-brown">Customer data will appear here once orders are placed</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                id={`user-${user._id}`}
                key={user._id}
                className="bg-clean-white rounded-2xl p-6 shadow-lg border border-beige hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-coffee-brown/10 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-coffee-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-dark-espresso">
                          {user.name || "No Name"}
                        </h3>
                        <span className="text-sm text-muted-brown">
                          {user.mobile}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-soft-cream/50 rounded-xl p-3">
                        <div className="text-xs text-muted-brown mb-1">User ID</div>
                        <div className="text-sm font-mono text-dark-espresso">{user._id}</div>
                      </div>
                      <div className="bg-soft-cream/50 rounded-xl p-3">
                        <div className="text-xs text-muted-brown mb-1">Total Orders</div>
                        <div className="text-lg font-bold text-coffee-brown">{user.orderCount || 0}</div>
                      </div>
                    </div>

                    {user.orders && user.orders.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user._id ? null : user._id
                          )
                        }
                        className="text-caramel-orange hover:text-dark-cocoa text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <svg className={`w-4 h-4 transition-transform ${expandedUser === user._id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {expandedUser === user._id ? "Hide Orders" : "Show Orders"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Orders */}
                {expandedUser === user._id &&
                  user.orders &&
                  user.orders.length > 0 && (
                    <div className="mt-6 border-t border-beige pt-6">
                      <h4 className="font-bold text-dark-cocoa mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Order History
                      </h4>
                      <div className="space-y-3">
                        {user.orders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-soft-cream/30 rounded-xl p-4 border border-beige"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-semibold text-sm text-dark-espresso">
                                  Order #{order._id.slice(-8)}
                                </div>
                                <div className="text-xs text-muted-brown">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status || "Pending Payment"}
                                </span>
                                <span className="text-lg font-bold text-coffee-brown">
                                  ₹{order.total || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-dark-cocoa mb-2">
                                  Items:
                                </div>
                                <div className="space-y-1">
                                  {order.items &&
                                    order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-muted-brown bg-clean-white rounded-lg px-2 py-1 inline-block mr-2 mb-1"
                                      >
                                        {item.name || item.title} x{item.qty || 1} - ₹{item.price || 0}
                                      </div>
                                    ))}
                                </div>
                              </div>
                              <button
                                onClick={() => setShowReceipt({ order, user })}
                                className="bg-caramel-orange text-white px-4 py-2 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Receipt
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <Receipt
            order={showReceipt.order}
            user={showReceipt.user}
            onClose={() => setShowReceipt(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
