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
    if (!name || name.trim().length < 2)
      return setError("Enter your name");
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
    if (!otp || otp.length !== 6)
      return setError("Enter a valid 6-digit OTP");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">
            {existingUser ? "Welcome Back!" : "Create Account"}
          </h3>
          <p className="text-orange-100 text-base">
            {existingUser
              ? `Hi ${existingUser.name}! Verify with OTP`
              : "Enter your details to get started"}
          </p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              {/* Mobile */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg focus:border-orange-500 outline-none"
                  placeholder="9876543210"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3 text-lg focus:border-orange-500 outline-none"
                  placeholder="Your name"
                  disabled={existingUser?.name}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-base text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAuth(false)}
                  className="flex-1 rounded-xl border px-4 py-3 text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onSend}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white"
                >
                  Send OTP
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <h4 className="text-xl font-semibold">Enter OTP</h4>
                <p className="text-base text-gray-500">
                  Sent to <span className="font-medium">{mobile}</span>
                </p>
              </div>

              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full border-2 rounded-xl px-4 py-3 text-center text-3xl tracking-widest focus:border-orange-500 outline-none"
                placeholder="000000"
                maxLength={6}
              />

              {demoOtp && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  Demo OTP:{" "}
                  <span className="font-bold font-mono">{demoOtp}</span>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-base text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border px-4 py-3 text-base"
                >
                  Back
                </button>
                <button
                  onClick={onVerify}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <h4 className="text-2xl font-bold text-green-600 mb-2">
                Login Successful 🎉
              </h4>
              <p className="text-base text-gray-600">
                You can now place orders and pay easily.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
