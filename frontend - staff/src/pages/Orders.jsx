import { useState, useEffect } from "react";
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
        },
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

  return (
    <div className="h-screen bg-soft-cream p-4 mt-2 w-full">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-cocoa">Order History</h2>
            <p className="text-sm text-muted-brown mt-1">Track and manage all customer orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-caramel-orange text-white py-3 px-6 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="bg-clean-white rounded-2xl shadow-lg border border-beige p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-coffee-brown/30 border-t-coffee-brown mx-auto mb-4"></div>
              <div className="text-muted-brown font-medium">Loading orders...</div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-clean-white rounded-2xl shadow-lg border border-beige p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-dark-cocoa mb-2">No orders found</h3>
              <p className="text-muted-brown">Orders will appear here once customers start placing them</p>
            </div>
          </div>
        ) : (
          <div className="bg-clean-white rounded-2xl overflow-hidden shadow-lg border border-beige">
            <table className="w-full">
              <thead className="bg-beige">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Table
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-dark-cocoa">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-soft-cream/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm text-dark-espresso">
                        #{order._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.tableNumber ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          Table {order.tableNumber}
                        </span>
                      ) : (
                        <span className="text-muted-brown">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isPosOrder || order.orderType === "pos" ? (
                        <span className="text-muted-brown">Walk-in</span>
                      ) : (
                        <button
                          onClick={() =>
                            navigate(`/users?userId=${order.userId}`)
                          }
                          className="text-caramel-orange hover:text-dark-cocoa hover:underline font-medium transition-colors"
                        >
                          {order.userName || order.userId || "Unknown"}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-xs bg-soft-cream/50 rounded-lg px-2 py-1 inline-block mr-1 mb-1">
                                {item.name || item.title} x{item.qty || 1} - ₹{item.price || 0}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-brown">No items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-coffee-brown">
                        ₹{order.total || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-coffee-brown/10 text-coffee-brown border border-coffee-brown/20">
                        {order.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-brown">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
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
                        className="bg-caramel-orange text-white px-4 py-2 rounded-xl hover:bg-dark-cocoa transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                        title="View Receipt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                      </button>
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
