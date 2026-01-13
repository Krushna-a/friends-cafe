/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function UserProvider({ children }) {
  const initialUser = (() => {
    try {
      const u = localStorage.getItem("fcc_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState(initialUser);
  // Do not show auth until the user explicitly tries to order/pay/see orders
  const [showAuth, setShowAuth] = useState(false);

  // If a token exists we try to restore user from server
  useEffect(() => {
    const token = localStorage.getItem("fcc_token");
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        if (r.ok && j.user) {
          setUser(j.user);
          setShowAuth(false);
          localStorage.setItem("fcc_user", JSON.stringify(j.user));
        } else {
          // invalid token
          localStorage.removeItem("fcc_token");
        }
      } catch (e) {
        console.warn("Failed to restore user", e);
      }
    })();
  }, []);

  // send otp via backend
  const sendOtp = async ({ mobile, name }) => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, name }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to send OTP");
      // return otp only in non-production (server returns otp for dev)
      return j.otp || null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const verifyOtp = async ({ mobile, code }) => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code }),
      });
      const j = await r.json();
      if (!r.ok) return false;
      if (j.token && j.user) {
        localStorage.setItem("fcc_token", j.token);
        localStorage.setItem("fcc_user", JSON.stringify(j.user));
        setUser(j.user);
        setShowAuth(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const checkUser = async (mobile) => {
    try {
      const r = await fetch(`${API_BASE}/api/auth/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const j = await r.json();
      if (r.ok && j.exists) {
        return { exists: true, name: j.name || "", mobile: j.mobile };
      }
      return { exists: false };
    } catch (e) {
      console.error("Failed to check user", e);
      return { exists: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fcc_user");
    localStorage.removeItem("fcc_token");
    setShowAuth(true);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        sendOtp,
        verifyOtp,
        checkUser,
        showAuth,
        setShowAuth,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

export default UserContext;
