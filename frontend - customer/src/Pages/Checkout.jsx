import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const formatCurrency = (v) => `₹ ${Number(v).toFixed(2)}`;

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const incomingOrder = location.state?.order || null;
  const { user, setShowAuth } = useUser();
  const { cart, updateQty, cartTotal, placeOrder, payOrder } = useCart();

  const [items, setItems] = useState(() => incomingOrder?.items || []);
  const [paid, setPaid] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const isIncoming = Boolean(incomingOrder);

  // If not logged in, prompt login
  useEffect(() => {
    if (!user) setShowAuth(true);
  }, [user, setShowAuth]);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      setRazorpayLoaded(false);
      toast.error("Failed to load payment gateway. Please refresh.");
    };
    document.body.appendChild(script);
  }, []);

  const total = useMemo(() => {
    if (isIncoming) return items.reduce((s, it) => s + it.price * it.qty, 0);
    return cartTotal;
  }, [isIncoming, items, cartTotal]);

  const source = isIncoming ? items : cart;

  // Handle go back navigation
  const handleGoBack = () => {
    if (isIncoming) {
      // If coming from orders page, go back to orders
      navigate("/orders");
    } else {
      // If coming from cart, go back to menu
      navigate("/menu");
    }
  };

  const changeQty = (idx, delta) => {
    if (isIncoming) {
      setItems((prev) => {
        const copy = [...prev];
        const newQty = copy[idx].qty + delta;
        if (newQty <= 0) return copy.filter((_, i) => i !== idx);
        copy[idx] = { ...copy[idx], qty: newQty };
        return copy;
      });
    } else {
      const item = cart[idx];
      if (!item) return;
      updateQty(item.name, item.qty + delta);
    }
  };

  const handlePay = async () => {
    console.log("Payment initiated...");

    // Check authentication state
    const token = localStorage.getItem("fcc_token");
    if (!user || !token) {
      console.log("User not authenticated, showing login");
      setShowAuth(true);
      return;
    }

    if (!window.Razorpay && !razorpayLoaded) {
      toast.error("Payment system not ready. Please refresh and try again.");
      return;
    }

    try {
      console.log("Creating payment order...");
      const r = await fetch(`${API_BASE}/api/pay/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total, // Razorpay expects paise
          provider: "upi",
        }),
      });

      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Payment initiation failed");

      console.log("Payment order created, opening Razorpay...");

      const options = {
        key: j.key,
        amount: j.amount,
        currency: j.currency || "INR",
        name: "Smart Café",
        description: "Payment for your order",
        order_id: j.orderId,
        prefill: {
          contact: user.mobile || "",
          name: user.name || "",
        },
        theme: { color: "#f97316" },

        handler: async function (response) {
          try {
            console.log("Payment successful, processing order...");

            // Check if user is still logged in before processing
            const token = localStorage.getItem("fcc_token");
            if (!token || !user) {
              console.error("User not authenticated during payment processing");
              toast.error("Authentication expired. Please log in again.");
              setShowAuth(true);
              setPaid(false);
              return;
            }

            if (isIncoming) {
              await payOrder(incomingOrder._id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            } else {
              await placeOrder({
                items: cart,
                paid: true,
                paymentId: response.razorpay_payment_id,
              });
            }

            console.log("Order processed successfully, navigating...");
            // toast.success("Payment successful!");
            // navigate("/orders", { replace: true });
          } catch (e) {
            console.error("Order processing error:", e);
            setPaid(false);

            // Check if it's an authentication error
            if (
              e.message.includes("logged in") ||
              e.message.includes("token")
            ) {
              toast.error("Authentication expired. Please log in again.");
              setShowAuth(true);
            } else {
              toast.error(
                "Payment succeeded but order update failed. Contact support."
              );
            }
          }
        },

        modal: {
          ondismiss: () => setPaid(false),
        },
      };

      const razor = new window.Razorpay(options);

      razor.on("payment.failed", function (response) {
        console.error("Payment failed:", response);
        setPaid(false);
        toast.error("Payment failed. Please try again.");
      });

      setPaid(true);
      razor.open();
    } catch (e) {
      console.error(e);
      toast.error("Payment failed to initiate. Try again.");
      setPaid(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-8 bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please login to pay</h2>
          <p className="text-gray-500">
            We opened the login window. Complete login to continue checkout.
          </p>
        </div>
      </div>
    );
  }

  if (
    (!isIncoming && cart.length === 0) ||
    (isIncoming && items.length === 0)
  ) {
    return (
      <div className="min-h-screen px-4 py-8 bg-white">
        <h2 className="text-xl font-semibold mb-2">Pay Bill</h2>
        <p className="text-gray-500">
          Your cart is empty. Add items from the{" "}
          <Link to="/menu" className="text-orange-500 font-medium">
            Menu
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-[#EFE6D8] px-3 py-2 sm:px-5 max-w-7xl mx-auto pb-28">
    
    {/* Header */}
    <div className="py-3 flex items-center justify-between">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-[#3B2A1F]">
          Pay Bill
        </h2>
        <p className="text-xs text-[#6F4E37]/70">
          Review items and complete payment
        </p>
      </div>
      <button
        onClick={handleGoBack}
        className="flex items-center gap-1 rounded-full border border-[#6F4E37]/30 bg-[#F6EFE6] px-3 py-1 text-xs font-medium text-[#6F4E37] hover:bg-[#6F4E37]/10 transition"
      >
        ← Back
      </button>
    </div>

    {/* Items */}
    <div className="space-y-2">
      {source.map((it, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between rounded-xl bg-[#F6EFE6] p-2 shadow-sm"
        >
          {/* Left */}
          <div className="flex items-center gap-2">
            {it.image ? (
              <img
                src={it.image}
                alt={it.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-[#E5D6C5] flex items-center justify-center text-xs text-[#6F4E37]/60">
                No Image
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-[#3B2A1F] leading-tight">
                {it.name}
              </div>
              <div className="text-xs text-[#6F4E37]/70">
                {formatCurrency(it.price)}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 rounded-full border border-[#6F4E37]/30 px-1.5 py-0.5">
              <button
                onClick={() => changeQty(idx, -1)}
                className="h-6 w-6 rounded-full text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                –
              </button>
              <div className="w-5 text-center text-xs font-semibold text-[#3B2A1F]">
                {it.qty}
              </div>
              <button
                onClick={() => changeQty(idx, +1)}
                className="h-6 w-6 rounded-full text-[#6F4E37] hover:bg-[#6F4E37]/10"
              >
                +
              </button>
            </div>

            <div className="text-xs font-semibold text-[#3B2A1F]">
              {formatCurrency(it.price * it.qty)}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Summary */}
    <div className="mt-3 rounded-xl bg-[#F6EFE6] p-3 shadow-sm">
      <div className="flex items-center justify-between text-xs text-[#6F4E37]/80">
        <span>Items</span>
        <span>{source.reduce((s, it) => s + it.qty, 0)}</span>
      </div>
      <div className="flex items-center justify-between mt-2 text-sm font-semibold text-[#3B2A1F]">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>

    {/* Payment Info */}
    <div className="mt-3 rounded-xl bg-[#EDE1D2] p-3">
      <div className="text-xs text-[#3B2A1F] mb-0.5">
        <span className="font-medium">Payment:</span> Online (UPI)
      </div>
      <div className="text-xs text-[#6F4E37]/80">
        <span className="font-medium">Phone:</span>{" "}
        {user.mobile || "Not set"}
      </div>
      <div className="text-[11px] text-[#6F4E37]/60 mt-1">
        Google Pay, PhonePe, Paytm supported
      </div>
    </div>

    {/* Bottom Pay Bar */}
    <div className="fixed left-0 right-0 bottom-0 z-50 border-t border-[#6F4E37]/20 bg-[#EFE6D8]/95 backdrop-blur">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-xs text-[#6F4E37]/70">
            Total to pay
          </div>
          <div className="text-lg font-semibold text-[#3B2A1F]">
            {formatCurrency(total)}
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={paid}
          className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow transition ${
            paid
              ? "bg-[#6F4E37]/40"
              : "bg-[#6F4E37] hover:opacity-90"
          }`}
        >
          {paid ? "Processing…" : "Pay Now"}
        </button>
      </div>
    </div>
  </div>
);

}
