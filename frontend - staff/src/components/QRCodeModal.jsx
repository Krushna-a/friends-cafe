import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const QRCodeModal = ({ table, onClose }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (table) generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/tables/${table._id}/qr`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.ok) {
        setQrCode(response.data.qrCode);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = qrCode;
    link.click();
  };

  const printQRCode = () => {
    if (!qrCode) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.tableNumber} QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              text-align: center;
              font-family: system-ui, sans-serif;
              background: white;
            }
            .qr-container {
              display: inline-block;
              border: 2px solid #e5e7eb;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { margin-bottom: 20px; }
            img { max-width: 240px; border-radius: 8px; }
            .instructions {
              margin-top: 16px;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>Table ${table.tableNumber}</h1>
            <img src="${qrCode}" />
            <div class="instructions">
              Scan this QR code to view the menu and place an order.
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (!table) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Table {table.tableNumber} QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-600">Generating QR Code…</p>
            </div>
          ) : qrCode ? (
            <>
              <div className="bg-gray-50 p-6 rounded-xl border mb-4">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto max-w-[200px] rounded-lg"
                />
              </div>

              <p className="text-sm text-gray-600 mb-6 text-center">
                Customers can scan this QR code to order from Table{" "}
                {table.tableNumber}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700"
                >
                  Download
                </button>
                <button
                  onClick={printQRCode}
                  className="flex-1 border rounded-lg py-2.5 hover:bg-gray-50"
                >
                  Print
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Failed to generate QR code
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
