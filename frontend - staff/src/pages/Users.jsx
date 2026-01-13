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
      <div className="h-screen bg-white p-4 mt-2 flex items-center justify-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white p-4 mt-2 w-full overflow-y-auto">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Customers</h2>
          <button
            onClick={fetchUsers}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                id={`user-${user._id}`}
                key={user._id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {user.name || "No Name"}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({user.mobile})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      User ID: {user._id}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Total Orders: {user.orderCount || 0}
                    </div>

                    {user.orders && user.orders.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user._id ? null : user._id
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedUser === user._id
                          ? "Hide Orders"
                          : "Show Orders"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Orders */}
                {expandedUser === user._id &&
                  user.orders &&
                  user.orders.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-3">Orders:</h4>
                      <div className="space-y-3">
                        {user.orders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-gray-50 rounded p-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium text-sm">
                                  Order ID: {order._id}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status || "Pending Payment"}
                                </span>
                                <span className="text-sm font-semibold">
                                  ₹{order.total || 0}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-xs font-medium text-gray-700 mb-1">
                                  Items:
                                </div>
                                <div className="space-y-1">
                                  {order.items &&
                                    order.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-gray-600"
                                      >
                                        {item.name || item.title} x
                                        {item.qty || 1} - ₹{item.price || 0}
                                      </div>
                                    ))}
                                </div>
                              </div>
                              <button
                                onClick={() => setShowReceipt({ order, user })}
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2"
                              >
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
