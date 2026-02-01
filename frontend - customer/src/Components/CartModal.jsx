import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function CartModal({ open, onClose }) {
  const { cart, updateQty, cartTotal } = useCart();
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-1"
      onClick={handleBackdropClick}
    >
      {/* Bottom Sheet */}
      <div className="w-full max-w-3xl rounded-t-3xl bg-[#EFE6D8] p-5 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#3B2A1F]">
              Your Cart
            </h3>
            <div className="text-sm text-[#6F4E37]/70">{cart.length} items</div>
          </div>
          <button
            onClick={onClose}
            className="text-sm text-[#6F4E37] hover:underline"
          >
            Close
          </button>
        </div>

        {/* Cart Items */}
        <div className="mt-1 space-y-2 max-h-[55vh] overflow-auto">
          {cart.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl bg-[#F6EFE6] p-2 shadow-sm"
            >
              {/* Image */}
              <div className="flex-shrink-0">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-16 w-16 rounded-xl object-cover "
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-[#E5D6C5] flex items-center justify-center text-xs text-[#6F4E37]/60">
                    No Image
                  </div>
                )}
              </div>

              {/* Name & Price */}
              <div className="flex-1 pl-3">
                <div className="text-sm sm:text-base font-medium text-[#3B2A1F]">
                  {it.name}
                </div>
                <div className="text-sm text-[#6F4E37]/70">₹ {it.price}.00</div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center">
                <button
                  onClick={() => updateQty(it.name, it.qty - 1)}
                  className="h-8 w-8 rounded-full border border-[#6F4E37]/30 text-[#6F4E37] text-lg hover:bg-[#6F4E37]/10"
                >
                  –
                </button>
                <div className="w-6 text-center font-semibold text-[#3B2A1F]">
                  {it.qty}
                </div>
                <button
                  onClick={() => updateQty(it.name, it.qty + 1)}
                  className="h-8 w-8 rounded-full border border-[#6F4E37]/30 text-[#6F4E37] text-lg hover:bg-[#6F4E37]/10"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 flex justify-between items-center border-t border-[#6F4E37]/20">
          <div className="text-base sm:text-lg font-semibold text-[#3B2A1F]">
            Total: ₹ {cartTotal}.00
          </div>
          <button
            onClick={handlePayNow}
            className="rounded-full bg-[#6F4E37] px-3 py-1 text-white font-semibold text-sm sm:text-base shadow-md hover:opacity-90 transition"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
