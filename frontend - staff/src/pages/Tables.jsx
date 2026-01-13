import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [generatingQR, setGeneratingQR] = useState(null);
  const [qrModal, setQrModal] = useState(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setTables(response.data.tables || []);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables`,
        { tableNumber: tableNumber.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        toast.success("Table added successfully");
        setTableNumber("");
        setShowAddModal(false);
        fetchTables();
      }
    } catch (error) {
      console.error("Error adding table:", error);
      toast.error(error.response?.data?.error || "Failed to add table");
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        toast.success("Table deleted successfully");
        fetchTables();
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error(error.response?.data?.error || "Failed to delete table");
    }
  };

  const handleGenerateQR = async (table) => {
    try {
      setGeneratingQR(table._id);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${table._id}/qr`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        setQrModal({
          table: table.tableNumber,
          qrCode: response.data.qrCode,
          qrUrl: response.data.qrUrl,
        });
        toast.success("QR code generated successfully");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setGeneratingQR(null);
    }
  };

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="h-screen bg-white p-4 mt-2 w-full">
      <div className="h-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tables Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Add Table
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tables found. Add your first table to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table._id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    Table {table.tableNumber}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      table.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {table.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <p>ID: {table._id}</p>
                  {table.qrUrl && (
                    <p className="text-xs text-gray-400 mt-1 break-all">
                      {table.qrUrl}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateQR(table)}
                    disabled={generatingQR === table._id}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
                  >
                    {generatingQR === table._id
                      ? "Generating..."
                      : "Get QR Code"}
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {qrModal && (
          <>
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .qr-modal-print, .qr-modal-print * {
                  visibility: visible;
                }
                .qr-modal-print {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  padding: 20px;
                  background: white;
                }
                .no-print-qr {
                  display: none !important;
                }
              }
            `}</style>
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="qr-modal-print bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Table {qrModal.table}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Scan this QR code to access the menu
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4 flex justify-center">
                  <img
                    src={qrModal.qrCode}
                    alt={`QR Code for Table ${qrModal.table}`}
                    className="w-64 h-64"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-6">
                  <p className="text-xs text-gray-500 text-center break-all">
                    {qrModal.qrUrl}
                  </p>
                </div>

                <div className="flex gap-3 no-print-qr">
                  <button
                    onClick={handlePrintQR}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                  >
                    Print QR Code
                  </button>
                  <button
                    onClick={() => setQrModal(null)}
                    className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-400 font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Table Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Add New Table</h3>
              <form onSubmit={handleAddTable}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 1, 2, 3, A1, B2"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Add Table
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setTableNumber("");
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tables;
