import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import QRCodeModal from "./QRCodeModal";

const TableSelectionScreen = ({ onTableSelect, onBack }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState({});
  const [selectedQRTable, setSelectedQRTable] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchActiveOrders();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        const allTables = response.data.tables || [];
        setTables(allTables);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        const orders = response.data.orders || [];
        const activeOrdersMap = {};

        orders.forEach((order) => {
          if (
            order.tableNumber &&
            (order.status === "confirmed" ||
              order.status === "preparing" ||
              order.status === "ready")
          ) {
            activeOrdersMap[order.tableNumber] = {
              itemCount: order.items?.length || 0,
              totalAmount: order.total || 0,
              status: order.kotPrinted ? "printed" : "running",
            };
          }
        });

        setActiveOrders(activeOrdersMap);
      }
    } catch (error) {
      console.error("Error fetching active orders:", error);
    }
  };

  const createTable = async () => {
    if (!newTableNumber.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`,
        { tableNumber: newTableNumber.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        toast.success(`Table ${newTableNumber} created successfully!`);
        setNewTableNumber("");
        setShowCreateModal(false);
        fetchTables();
      }
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error(error.response?.data?.error || "Failed to create table");
    } finally {
      setCreating(false);
    }
  };

  const deleteTable = async (tableId, tableNumber) => {
    if (!confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${tableId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        toast.success(`Table ${tableNumber} deleted successfully!`);
        fetchTables();
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Failed to delete table");
    }
  };

  const getTableStatusClass = (tableNumber) => {
    const order = activeOrders[tableNumber];
    if (!order)
      return "bg-gradient-to-br from-soft-cream  to-beige border border-coffee-brown/20 text-coffee-brown hover:from-beige hover:to-soft-cream hover:border-coffee-brown/30 hover:shadow-lg transform hover:scale-105"; // Available

    switch (order.status) {
      case "running":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-lg"; // Running
      case "printed":
        return "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300 hover:shadow-lg"; // Printed
      case "paid":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 text-yellow-800 hover:from-yellow-100 hover:to-amber-100 hover:border-yellow-300 hover:shadow-lg"; // Paid
      default:
        return "bg-gradient-to-br from-soft-cream to-beige border border-coffee-brown/20 text-coffee-brown hover:from-beige hover:to-soft-cream hover:border-coffee-brown/30 hover:shadow-lg transform hover:scale-105";
    }
  };

  const handleTableClick = (table, event) => {
    // If QR icon was clicked, show QR modal
    if (event.target.closest(".qr-icon")) {
      event.stopPropagation();
      setSelectedQRTable(table);
      return;
    }

    // If delete button was clicked, delete table
    if (event.target.closest(".delete-btn")) {
      event.stopPropagation();
      deleteTable(table._id, table.tableNumber);
      return;
    }

    // Otherwise, select table for POS
    onTableSelect(table);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-cream flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-coffee-brown/30 border-t-coffee-brown mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-coffee-brown to-caramel-orange opacity-20 animate-pulse"></div>
          </div>
          <div className="text-coffee-brown text-lg font-medium">
            Loading tables...
          </div>
          <div className="text-muted-brown text-sm mt-2">
            Preparing your café experience
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-soft-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-cocoa via-coffee-brown to-dark-cocoa shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-3 hover:bg-coffee-brown/20 rounded-2xl transition-all duration-300 text-clean-white hover:text-white hover:shadow-lg transform hover:scale-105"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="text-white">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Select Table
                </h1>
                <p className="text-clean-white/80 text-sm mt-1 font-medium">
                  Choose a table to start your café service
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-caramel-orange to-coffee-brown text-white text-sm font-semibold rounded-2xl hover:from-coffee-brown hover:to-dark-cocoa transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Table
            </button>
          </div>
        </div>
      </div>

      {/* Tables Display */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {tables.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-beige to-coffee-brown/20 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-coffee-brown"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-dark-cocoa mb-3">
              No Tables Available
            </h3>
            <p className="text-muted-brown mb-8 max-w-md mx-auto leading-relaxed">
              Create your first table to start serving customers and managing
              your café experience.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-caramel-orange to-coffee-brown text-white font-semibold rounded-2xl hover:from-coffee-brown hover:to-dark-cocoa transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 sm:gap-6">
            {tables.map((table) => (
              <div
                key={table._id}
                onClick={(e) => handleTableClick(table, e)}
                className={`${getTableStatusClass(table.tableNumber)} rounded-3xl p-6 cursor-pointer transition-all duration-300 text-center min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center font-semibold text-lg relative group shadow-lg backdrop-blur-sm`}
              >
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {table.tableNumber}
                </div>

                {/* Action Icons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    className="qr-icon w-8 h-8 bg-caramel-orange text-white rounded-full flex items-center justify-center text-sm hover:bg-dark-cocoa transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                    title="Show QR Code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2z" />
                    </svg>
                  </button>
                  <button
                    className="delete-btn w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                    title="Delete Table"
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
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Order info if active */}
                {activeOrders[table.tableNumber] && (
                  <div className="text-xs font-medium mt-2 bg-clean-white bg-opacity-60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    {activeOrders[table.tableNumber].itemCount} items
                  </div>
                )}

                {/* Status indicator */}
                <div className="absolute bottom-3 left-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activeOrders[table.tableNumber]
                        ? activeOrders[table.tableNumber].status === "running"
                          ? "bg-blue-500 animate-pulse"
                          : activeOrders[table.tableNumber].status === "printed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        : "bg-green-400"
                    } shadow-lg`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-clean-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-caramel-orange to-coffee-brown px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Add New Table</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTableNumber("");
                  }}
                  className="text-clean-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-coffee-brown/20"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-dark-cocoa mb-3">
                  Table Number
                </label>
                <input
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g., 1, 2, A1, VIP-1"
                  className="w-full px-4 py-4 border-2 border-coffee-brown/30 rounded-2xl focus:ring-4 focus:ring-coffee-brown/20 focus:border-coffee-brown transition-all duration-300 text-dark-espresso placeholder-muted-brown font-medium"
                  onKeyDown={(e) => e.key === "Enter" && createTable()}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTableNumber("");
                  }}
                  className="flex-1 py-4 px-4 border-2 border-coffee-brown/30 text-coffee-brown rounded-2xl hover:bg-coffee-brown/10 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={createTable}
                  disabled={creating || !newTableNumber.trim()}
                  className="flex-1 py-4 px-4 bg-gradient-to-r from-caramel-orange to-coffee-brown text-white rounded-2xl hover:from-coffee-brown hover:to-dark-cocoa disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {creating ? "Creating..." : "Create Table"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQRTable && (
        <QRCodeModal
          table={selectedQRTable}
          onClose={() => setSelectedQRTable(null)}
        />
      )}
    </div>
  );
};

export default TableSelectionScreen;
