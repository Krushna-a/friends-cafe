import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Receipt from "../components/Receipt";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh orders every 5 seconds to see new orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.patch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        toast.success("Order status updated successfully");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update order status"
      );
    }
  };

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

  return (
    <div className="h-screen bg-white p-4 mt-2 w-full">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Orders</h2>
          <button
            onClick={fetchOrders}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.tableNumber ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Table {order.tableNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <button
                        onClick={() =>
                          navigate(`/users?userId=${order.userId}`)
                        }
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {order.userName || order.userId || "Unknown"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.name || item.title} x{item.qty || 1} - ₹
                                {item.price || 0}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">No items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      ₹{order.total || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending Payment"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <select
                          value={order.status || "Pending Payment"}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="Pending Payment">
                            Pending Payment
                          </option>
                          <option value="Paid">Paid</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          onClick={() =>
                            setShowReceipt({
                              order,
                              user: {
                                name: order.userName,
                                mobile: order.userMobile,
                              },
                            })
                          }
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          title="View Receipt"
                        >
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Orders;
