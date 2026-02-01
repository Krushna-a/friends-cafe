/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const CartContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function CartProvider({ children }) {
  const { user } = useUser();

  // Get table number from URL parameter
  const getTableFromURL = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("table") || null;
    }
    return null;
  };

  // Initialize table number from URL or localStorage
  const [tableNumber, setTableNumber] = useState(() => {
    const urlTable = getTableFromURL();
    if (urlTable) {
      localStorage.setItem("fcc_table", urlTable);
      return urlTable;
    }
    try {
      return localStorage.getItem("fcc_table") || null;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  });

  // Update table number if URL changes
  useEffect(() => {
    const urlTable = getTableFromURL();
    if (urlTable && urlTable !== tableNumber) {
      setTableNumber(urlTable);
      localStorage.setItem("fcc_table", urlTable);
    }
  }, [tableNumber]);

  // Lazy initialization from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("fcc_cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.warn("Failed to load cart from storage", e);
      return [];
    }
  });

  // Orders should ALWAYS come from database, not localStorage
  const [orders, setOrders] = useState([]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem("fcc_cart", JSON.stringify(cart));
  }, [cart]);

  // DO NOT persist orders to localStorage - always fetch from database

  // Add item to cart
  const addItem = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.name === item.name);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          qty: copy[idx].qty + (item.qty || 1),
        };
        return copy;
      }
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  };

  // Remove item from cart
  const removeItem = (name) =>
    setCart((prev) => prev.filter((i) => i.name !== name));

  // Update quantity (remove item if qty becomes 0 or less)
  const updateQty = (name, qty) => {
    if (qty <= 0) {
      removeItem(name);
      return;
    }
    setCart((prev) => prev.map((i) => (i.name === name ? { ...i, qty } : i)));
  };

  const clearCart = () => setCart([]);

  // Fetch orders from server when user logs in - ALWAYS from database
  useEffect(() => {
    const token = localStorage.getItem("fcc_token");

    if (!token) {
      setOrders([]);
      return;
    }

    const fetchOrdersFromDB = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = await r.json();
        if (r.ok) {
          // Always use fresh data from database - no caching
          const backendOrders = j.orders || [];
          setOrders(backendOrders);
        } else {
          // If fetch fails, clear orders to avoid stale data
          setOrders([]);
        }
      } catch (e) {
        console.error("Failed to fetch orders from database:", e);
        // On error, clear orders to avoid showing stale data
        setOrders([]);
      }
    };

    // If user is set, fetch immediately
    if (user) {
      fetchOrdersFromDB();
      const interval = setInterval(fetchOrdersFromDB, 5000);
      return () => clearInterval(interval);
    }

    // If user not set but token exists, check localStorage for user
    // This handles the case when page refreshes and user is being restored
    const storedUser = localStorage.getItem("fcc_user");
    if (storedUser) {
      // User exists in localStorage, fetch orders
      fetchOrdersFromDB();
      const interval = setInterval(fetchOrdersFromDB, 5000);
      return () => clearInterval(interval);
    }

    // No user yet, wait for restoration (max 2 seconds)
    const timeout = setTimeout(() => {
      const checkUser = localStorage.getItem("fcc_user");
      if (checkUser) {
        fetchOrdersFromDB();
      } else {
        setOrders([]);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [user]);

  const placeOrder = async ({ items = cart, paid = false, paymentId } = {}) => {
    console.log("placeOrder called with:", {
      itemsCount: items?.length,
      paid,
      paymentId,
      items: items,
    });

    if (!items || items.length === 0) {
      console.log("No items to place order");
      return null;
    }

    const token = localStorage.getItem("fcc_token");
    console.log("Token exists:", !!token);

    if (token) {
      try {
        // First verify the token is still valid
        console.log("Verifying token...");
        const authCheck = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!authCheck.ok) {
          console.log("Token verification failed");
          // Token is invalid, remove it and throw error
          localStorage.removeItem("fcc_token");
          localStorage.removeItem("fcc_user");
          throw new Error("Your session has expired. Please log in again.");
        }

        console.log("Token verified, creating order...");
        const r = await fetch(`${API_BASE}/api/orders`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items, paid, tableNumber }),
        });

        console.log("Order creation response status:", r.status);
        const j = await r.json();
        console.log("Order creation response:", j);

        if (!r.ok) {
          throw new Error(j.error || "Failed to place order");
        }

        console.log("Order created successfully:", j.order);

        // Order successfully created on backend
        // ALWAYS refresh orders from database to ensure sync
        console.log("Refreshing orders from database...");
        const refreshRes = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          // Use fresh data from database
          console.log("Orders refreshed successfully");
          setOrders(refreshData.orders || []);
        } else {
          // If refresh fails, at least add the new order we just created
          console.log("Orders refresh failed, adding new order locally");
          setOrders((prev) => [j.order, ...prev]);
        }
        clearCart();
        return j.order;
      } catch (e) {
        console.error("Failed to place order on backend:", e);
        // Don't fallback to local - throw error so user knows
        throw new Error("Failed to place order. Please try again.");
      }
    } else {
      console.error("No authentication token found");
      throw new Error(
        "You must be logged in to place an order. Please log in and try again.",
      );
    }
  };

  const payOrder = async (orderId, paymentDetails) => {
    const token = localStorage.getItem("fcc_token");
    if (token) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        let body;
        if (paymentDetails) {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(paymentDetails);
        }

        const r = await fetch(`${API_BASE}/api/orders/${orderId}/pay`, {
          method: "PATCH",
          headers,
          body,
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Failed to pay");

        // Refresh orders from database after payment
        const refreshRes = await fetch(`${API_BASE}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) {
          setOrders(refreshData.orders || []);
        } else {
          // Fallback to updating local state
          setOrders((prev) =>
            prev.map((o) => (o._id === orderId ? j.order : o)),
          );
        }
        return j.order;
      } catch (e) {
        console.error("Failed to pay order:", e);
        throw e;
      }
    }
    throw new Error("You must be logged in to pay");
  };

  const cartCount = cart.reduce((s, it) => s + (it.qty || 0), 0);
  const cartTotal = cart.reduce(
    (s, it) => s + (it.price || 0) * (it.qty || 0),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
        orders,
        setOrders,
        placeOrder,
        payOrder,
        tableNumber,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export const useCart = () => useContext(CartContext);

export default CartContext;
