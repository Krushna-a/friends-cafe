import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function CartModal({ open, onClose }) {
  const { cart, updateQty, removeItem, cartTotal } = useCart();
  const { user, setShowAuth } = useUser();
  const navigate = useNavigate();

  // Close modal when cart becomes empty
  useEffect(() => {
    if (open && cart.length === 0) {
      onClose();
    }
  }, [cart.length, open, onClose]);

  if (!open) return null;


  // Handle Pay Now button
  const handlePayNow = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    onClose(); // Close modal first
    navigate("/checkout");
  };

  // Handle click outside to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl rounded-t-3xl bg-white p-5">
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-semibold">Your Cart</h3>
            <div className="text-base text-gray-500">{cart.length} items</div>
          </div>
          <button onClick={onClose} className="text-base text-gray-600">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[55vh] overflow-auto">
          {cart.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              {/* Product Image */}
              <div className="flex-shrink-0">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="text-lg font-medium">{it.name}</div>
                <div className="text-base text-gray-500">₹ {it.price}.00</div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQty(it.name, it.qty - 1)}
                  className="px-3 py-1 border rounded-lg text-lg"
                >
                  –
                </button>
                <div className="text-lg font-semibold">{it.qty}</div>
                <button
                  onClick={() => updateQty(it.name, it.qty + 1)}
                  className="px-3 py-1 border rounded-lg text-lg"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(it.name)}
                  className="text-base text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t pt-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Total: ₹ {cartTotal}.00</div>
          <button
            onClick={handlePayNow}
            className="rounded-lg bg-green-600 px-6 py-2 text-white font-semibold text-base hover:bg-green-700 transition"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
