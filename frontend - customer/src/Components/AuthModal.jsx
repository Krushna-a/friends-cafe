import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function AuthModal() {
  const { showAuth, setShowAuth, sendOtp, verifyOtp, checkUser } = useUser();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState(null);
  const [error, setError] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  useEffect(() => {
    const checkExistingUser = async () => {
      if (mobile && mobile.length >= 10) {
        setCheckingUser(true);
        const result = await checkUser(mobile);
        if (result.exists) {
          setExistingUser(result);
          setName(result.name || "");
        } else {
          setExistingUser(null);
          setName("");
        }
        setCheckingUser(false);
      } else {
        setExistingUser(null);
        setName("");
      }
    };

    const timeoutId = setTimeout(checkExistingUser, 500);
    return () => clearTimeout(timeoutId);
  }, [mobile, checkUser]);

  if (!showAuth) return null;

  const onSend = async () => {
    if (!mobile || mobile.length < 10)
      return setError("Enter a valid 10-digit mobile number");
    if (!name || name.trim().length < 2) return setError("Enter your name");
    setError(null);
    try {
      const code = await sendOtp({ mobile, name: name.trim() });
      setDemoOtp(code);
      setStep(2);
    } catch (e) {
      setError(e.message || "Failed to send OTP");
    }
  };

  const onVerify = async () => {
    if (!otp || otp.length !== 6) return setError("Enter a valid 6-digit OTP");
    setError(null);
    try {
      const ok = await verifyOtp({ mobile, code: otp });
      if (!ok) return setError("Invalid OTP. Please try again.");
      setStep(3);
      setTimeout(() => setShowAuth(false), 1500);
    } catch (e) {
      setError(e.message || "Verification failed");
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
            ? `Hi ${existingUser.name}! Verify with OTP`
            : "Enter your details to get started"}
        </p>
      </div>

      {/* Body */}
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            
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
                className="
                  w-full rounded-xl px-4 py-2.5
                  text-sm sm:text-base
                  border border-coffee-brown/30
                  bg-clean-white
                  focus:outline-none focus:ring-2 focus:ring-coffee-brown/40
                "
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
                disabled={existingUser?.name}
                className="
                  w-full rounded-xl px-4 py-2.5
                  text-sm sm:text-base
                  border border-coffee-brown/30
                  bg-clean-white
                  focus:outline-none focus:ring-2 focus:ring-coffee-brown/40
                  disabled:bg-soft-cream
                "
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
                className="
                  flex-1 rounded-xl border border-coffee-brown/30
                  px-4 py-2 text-sm font-medium text-coffee-brown
                  hover:bg-coffee-brown/10
                "
              >
                Cancel
              </button>
              <button
                onClick={onSend}
                className="
                  flex-1 rounded-xl bg-caramel-orange
                  px-4 py-2 text-sm font-semibold text-clean-white
                  hover:bg-dark-cocoa transition
                "
              >
                Send OTP
              </button>
            </div>
          </div>
        )}

{step === 2 && (
  <div className="space-y-6">
    
    {/* Title */}
    <div className="text-center">
      <h4 className="sm:text-lg font-semibold text-dark-espresso tracking-wide">
        Enter OTP
      </h4>
      <p className="text-xs sm:text-sm text-muted-brown mt-0.5">
        Sent to <span className="font-medium">{mobile}</span>
      </p>
    </div>

    {/* OTP Boxes */}
    <div className="flex justify-evenly">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[i] || ""}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (!val) return;

            const newOtp = otp.split("");
            newOtp[i] = val;
            setOtp(newOtp.join("").slice(0, 6));

            const next = e.target.nextSibling;
            if (next) next.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !otp[i]) {
              const prev = e.target.previousSibling;
              if (prev) prev.focus();
            }
          }}
          className="
            h-12 w-10 sm:h-14 sm:w-12
            rounded-xl
            bg-clean-white/90
            backdrop-blur
            text-center
            text-lg sm:text-xl
            font-semibold
            text-dark-cocoa
            border border-coffee-brown/30
            shadow-sm
            transition
            focus:outline-none
            focus:ring-2
            focus:ring-coffee-brown
            focus:scale-105
          "
        />
      ))}
    </div>

    {/* Demo OTP */}
    {demoOtp && (
      <div className="p-3 rounded-xl bg-clean-white/50 text-xs text-dark-espresso text-center">
        Demo OTP:{" "}
        <span className="font-mono font-bold tracking-wider">
          {demoOtp}
        </span>
      </div>
    )}

    {/* Error */}
    {error && (
      <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 text-center">
        {error}
      </div>
    )}

    {/* Actions */}
    <div className="flex gap-3 pt-3">
      <button
        onClick={() => setStep(1)}
        className="
          flex-1 rounded-full
          border border-coffee-brown/40
          px-4 py-2
          text-sm font-medium
          text-coffee-brown
          hover:bg-coffee-brown/10
          transition
        "
      >
        Back
      </button>
      <button
        onClick={onVerify}
        className="
          flex-1 rounded-full
          bg-caramel-orange
          px-4 py-2
          text-sm font-semibold
          text-clean-white
          shadow-md
          hover:bg-dark-cocoa
          active:scale-95
          transition
        "
      >
        Verify
      </button>
    </div>
  </div>
)}



        {step === 3 && (
          <div className="text-center py-8">
            <h4 className="text-lg sm:text-xl font-bold text-green-600 mb-2">
              Login Successful 🎉
            </h4>
            <p className="text-xs sm:text-sm text-muted-brown">
              You can now place orders and pay easily.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

}
