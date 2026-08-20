import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function AuthModal() {
  const { showAuth, setShowAuth, login, checkUser } = useUser();
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  useEffect(() => {
    if (mobile.length < 10) {
      setExistingUser(null);
      setName("");
      return;
    }
    const id = setTimeout(async () => {
      const result = await checkUser(mobile);
      if (result.exists) {
        setExistingUser(result);
        setName(result.name || "");
      } else {
        setExistingUser(null);
        setName("");
      }
    }, 500);
    return () => clearTimeout(id);
  }, [mobile, checkUser]);

  if (!showAuth) return null;

  const onSubmit = async () => {
    if (!mobile || mobile.length < 10)
      return setError("Enter a valid 10-digit mobile number");
    if (!name || name.trim().length < 2) return setError("Enter your name");
    setError(null);
    setLoading(true);
    try {
      await login({ mobile, name: name.trim() });
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-beige shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-dark-cocoa p-6 text-clean-white">
          <h3 className="text-lg sm:text-2xl font-bold mb-1">
            {existingUser ? "Welcome Back!" : "Create Account"}
          </h3>
          <p className="text-clean-white/80 text-sm sm:text-base">
            {existingUser
              ? `Hi ${existingUser.name}! Confirm to continue`
              : "Enter your details to get started"}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Mobile */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-dark-cocoa mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base border border-coffee-brown/30 bg-clean-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/40"
              placeholder="9876543210"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-dark-cocoa mb-1">
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!!existingUser?.name}
              className="w-full rounded-xl px-4 py-2.5 text-sm sm:text-base border border-coffee-brown/30 bg-clean-white focus:outline-none focus:ring-2 focus:ring-coffee-brown/40 disabled:bg-soft-cream"
              placeholder="Your name"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-xs sm:text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAuth(false)}
              className="flex-1 rounded-xl border border-coffee-brown/30 px-4 py-2 text-sm font-medium text-coffee-brown hover:bg-coffee-brown/10"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-caramel-orange px-4 py-2 text-sm font-semibold text-clean-white hover:bg-dark-cocoa transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
