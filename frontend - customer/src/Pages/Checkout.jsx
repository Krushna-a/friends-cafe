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
      console.log("Payment response:", j);

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
            console.log("Payment response:", response);

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
              console.log("Processing existing order payment...");
              await payOrder(incomingOrder._id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            } else {
              console.log("Creating new order...");
              console.log("Cart items:", cart);
              await placeOrder({
                items: cart,
                paid: true,
                paymentId: response.razorpay_payment_id,
              });
            }

            console.log("Order processed successfully, navigating...");
            toast.success("Payment successful!");
            setPaid(false);
            navigate("/orders", { replace: true });
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
                "Payment succeeded but order update failed. Contact support.",
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
      <div className="min-h-screen px-4 py-8 bg-soft-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-dark-cocoa">Please login to pay</h2>
          <p className="text-muted-brown">
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
      <div className="min-h-screen px-4 py-8 bg-soft-cream">
        <h2 className="text-xl font-semibold mb-2 text-dark-cocoa">Pay Bill</h2>
        <p className="text-muted-brown">
          Your cart is empty. Add items from the{" "}
          <Link to="/menu" className="text-caramel-orange font-medium">
            Menu
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-cream px-4 py-3 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-dark-cocoa">
            Pay Bill
          </h2>
          <p className="text-xs sm:text-sm text-muted-brown">
            Review items and complete payment.
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 rounded-lg border border-coffee-brown/30 bg-clean-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-coffee-brown hover:bg-coffee-brown/10 transition"
        >
          <span>←</span>
          <span>Go Back</span>
        </button>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {source.map((it, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-2xl bg-clean-white p-3 shadow-sm border border-beige"
          >
            <div className="flex items-center gap-3">
              {it.image ? (
                <img
                  src={it.image}
                  alt={it.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-beige flex items-center justify-center text-muted-brown text-xs">
                  No Image
                </div>
              )}
              <div>
                <div className="font-medium text-dark-espresso">{it.name}</div>
                <div className="text-sm text-muted-brown">
                  {formatCurrency(it.price)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-full border border-coffee-brown/30 px-2 py-1">
                <button
                  onClick={() => changeQty(idx, -1)}
                  className="px-2 font-semibold text-coffee-brown"
                >
                  –
                </button>
                <div className="px-2 text-sm font-semibold text-dark-espresso">{it.qty}</div>
                <button
                  onClick={() => changeQty(idx, +1)}
                  className="px-2 font-semibold text-coffee-brown"
                >
                  +
                </button>
              </div>
              <div className="text-sm font-semibold text-dark-espresso">
                {formatCurrency(it.price * it.qty)}
              </div>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="mt-4 rounded-2xl bg-clean-white p-4 shadow-sm border border-beige">
          <div className="flex items-center justify-between text-sm text-muted-brown">
            <span>Items</span>
            <span>{source.reduce((s, it) => s + it.qty, 0)}</span>
          </div>

          <div className="flex items-center justify-between mt-2 text-base sm:text-lg font-semibold text-dark-espresso">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-4 rounded-2xl bg-beige p-4">
          <div className="text-sm text-dark-espresso mb-1">
            <span className="font-medium">Payment:</span> Online (UPI)
          </div>
          <div className="text-sm text-muted-brown">
            <span className="font-medium">Phone:</span>{" "}
            {user.mobile || "Not set"}
          </div>
          <div className="text-xs text-muted-brown mt-1">
            Google Pay, PhonePe, PayTM supported
          </div>
        </div>
      </div>

      {/* Bottom Pay Bar */}
      <div className="fixed left-0 right-0 bottom-0 z-50 border-t border-beige bg-clean-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1 text-sm text-muted-brown hover:text-coffee-brown transition"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div>
              <div className="text-xs sm:text-sm text-muted-brown">
                Total to pay
              </div>
              <div className="text-lg sm:text-xl font-semibold text-dark-espresso">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={paid}
            className={`rounded-full px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-white transition ${
              paid ? "bg-gray-400" : "bg-caramel-orange hover:bg-dark-cocoa"
            }`}
          >
            {paid ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
