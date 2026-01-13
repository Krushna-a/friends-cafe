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
    <div className="fixed left-0 right-0 bottom-14 z-40 px-4">
      <div className="max-w-3xl mx-auto rounded-2xl bg-white border p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-base text-gray-600">{cartCount} items</div>
          <div className="text-xl font-bold">₹ {total}.00</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="rounded-lg border px-4 py-2 text-base"
          >
            View Cart
          </button>
          <button
            onClick={handlePayNow}
            className="rounded-lg bg-green-600 px-4 py-2 text-white font-semibold text-base"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
