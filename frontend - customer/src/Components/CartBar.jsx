import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function CartBar({ cartCount, total, onOpenCart }) {
  const { user, setShowAuth } = useUser();
  const navigate = useNavigate();
  const { cart, placeOrder } = useCart();

  if (cartCount === 0) return null;

  const handlePayNow = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="fixed left-0 right-0 bottom-16 z-40 px-4">
      <div className="max-w-3xl mx-auto rounded-full bg-white border p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-xs sm:text-base text-gray-600">
            {cartCount} items
          </div>
          <div className="text-sm sm:text-xl font-bold">₹ {total}.00</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
          >
            View Cart
          </button>
          <button
            onClick={handlePayNow}
            className="rounded-full bg-[#6F4E37] px-3 sm:px-4 py-1.5 sm:py-2 text-white font-semibold text-sm sm:text-base"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
