import { useState, useEffect } from "react";
import axios from "axios";

export const useSettings = () => {
  const [settings, setSettings] = useState({
    cafeName: "Friends Cafe",
    cafeTagline: "Coffee & More",
    logo: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    phone: "",
    email: "",
    website: "",
    gstNumber: "",
    fssaiNumber: "",
    currency: "INR",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata",
    defaultTaxRate: 18,
    serviceChargeRate: 0,
    receiptHeader: "",
    receiptFooter: "Thank you for your business!\nVisit us again soon",
    printLogo: true,
    autoKotPrint: false,
    autoBillPrint: false,
    roundOffBills: true,
    lowStockAlert: true,
    lowStockThreshold: 10,
    orderNotifications: true,
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      whatsapp: "",
    },
    primaryColor: "#059669",
    secondaryColor: "#0891b2",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refetch: fetchSettings };
};
