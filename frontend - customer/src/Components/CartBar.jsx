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
    <div className="fixed left-0 right-0 bottom-20 z-40 px-4">
      <div className="max-w-3xl mx-auto rounded-full bg-clean-white border border-beige p-4 flex items-center justify-between shadow-lg">
        <div>
          <div className="text-xs sm:text-base text-muted-brown">
            {cartCount} items
          </div>
          <div className="text-sm sm:text-xl font-bold text-dark-espresso">₹ {total}.00</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="rounded-full border border-coffee-brown/30 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-coffee-brown hover:bg-coffee-brown/10 transition"
          >
            View Cart
          </button>
          <button
            onClick={handlePayNow}
            className="rounded-full bg-caramel-orange px-3 sm:px-4 py-1.5 sm:py-2 text-white font-semibold text-sm sm:text-base hover:bg-dark-cocoa transition"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
