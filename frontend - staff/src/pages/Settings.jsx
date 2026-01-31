import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
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
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        setSettings(response.data.settings);
        setLogoPreview(response.data.settings.logo || "");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const formData = new FormData();

      // Add all settings data
      Object.keys(settings).forEach((key) => {
        if (typeof settings[key] === "object" && settings[key] !== null) {
          formData.append(key, JSON.stringify(settings[key]));
        } else {
          formData.append(key, settings[key]);
        }
      });

      // Add logo file if selected
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/settings`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.ok) {
        setSettings(response.data.settings);
        setLogoPreview(response.data.settings.logo || "");
        setLogoFile(null);
        toast.success("Settings updated successfully!");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(error.response?.data?.error || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: "🏪" },
    { id: "business", name: "Business", icon: "📋" },
    { id: "receipt", name: "Receipt", icon: "🧾" },
    { id: "pos", name: "POS", icon: "💳" },
    { id: "notifications", name: "Notifications", icon: "🔔" },
    { id: "social", name: "Social Media", icon: "📱" },
    { id: "appearance", name: "Appearance", icon: "🎨" },
  ];

  if (loading) {
    return (
      <div className="h-screen bg-soft-cream p-4 mt-2 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-coffee-brown/30 border-t-coffee-brown mx-auto mb-4"></div>
          <div className="text-muted-brown font-medium">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-soft-cream p-4 mt-2 w-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-cocoa mb-2">
            Settings
          </h1>
          <p className="text-muted-brown">
            Manage your café settings and preferences
          </p>
        </div>

        <div className="bg-clean-white rounded-2xl shadow-lg border border-beige">
          {/* Tabs */}
          <div className="border-b border-beige">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-coffee-brown text-coffee-brown"
                      : "border-transparent text-muted-brown hover:text-dark-cocoa hover:border-coffee-brown/30"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-dark-cocoa mb-4">
                    Café Information
                  </h3>

                  {/* Logo Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-dark-cocoa mb-2">
                      Café Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 border-2 border-dashed border-coffee-brown/30 rounded-2xl flex items-center justify-center overflow-hidden bg-soft-cream/30">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <span className="text-muted-brown text-xs">No Logo</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer bg-caramel-orange text-white px-4 py-2 rounded-xl hover:bg-dark-cocoa transition-colors text-sm font-semibold"
                        >
                          Upload Logo
                        </label>
                        <p className="text-xs text-muted-brown mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Café Name
                      </label>
                      <input
                        type="text"
                        value={settings.cafeName}
                        onChange={(e) =>
                          handleInputChange("cafeName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={settings.cafeTagline}
                        onChange={(e) =>
                          handleInputChange("cafeTagline", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-bold text-dark-cocoa mb-3">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={settings.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-bold text-dark-cocoa mb-3">
                    Address
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-dark-cocoa mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={settings.address.street}
                        onChange={(e) =>
                          handleInputChange("address.street", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-dark-cocoa mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={settings.address.city}
                          onChange={(e) =>
                            handleInputChange("address.city", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-cocoa mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={settings.address.state}
                          onChange={(e) =>
                            handleInputChange("address.state", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-cocoa mb-1">
                          Pincode
                        </label>
                        <input
                          type="text"
                          value={settings.address.pincode}
                          onChange={(e) =>
                            handleInputChange("address.pincode", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-coffee-brown/20 rounded-xl focus:ring-2 focus:ring-coffee-brown focus:border-coffee-brown bg-soft-cream/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={settings.gstNumber}
                        onChange={(e) =>
                          handleInputChange("gstNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        FSSAI Number
                      </label>
                      <input
                        type="text"
                        value={settings.fssaiNumber}
                        onChange={(e) =>
                          handleInputChange("fssaiNumber", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Tax Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.defaultTaxRate}
                        onChange={(e) =>
                          handleInputChange(
                            "defaultTaxRate",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Charge Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.serviceChargeRate}
                        onChange={(e) =>
                          handleInputChange(
                            "serviceChargeRate",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Currency Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) =>
                          handleInputChange("currency", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="INR">Indian Rupee (INR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency Symbol
                      </label>
                      <input
                        type="text"
                        value={settings.currencySymbol}
                        onChange={(e) =>
                          handleInputChange("currencySymbol", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) =>
                          handleInputChange("timezone", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">
                          America/New_York (EST)
                        </option>
                        <option value="Europe/London">
                          Europe/London (GMT)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Tab */}
            {activeTab === "receipt" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Receipt Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receipt Header
                      </label>
                      <textarea
                        value={settings.receiptHeader}
                        onChange={(e) =>
                          handleInputChange("receiptHeader", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional text to show at the top of receipts"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Receipt Footer
                      </label>
                      <textarea
                        value={settings.receiptFooter}
                        onChange={(e) =>
                          handleInputChange("receiptFooter", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Thank you message or additional information"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="printLogo"
                        checked={settings.printLogo}
                        onChange={(e) =>
                          handleInputChange("printLogo", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="printLogo"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Print logo on receipts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* POS Tab */}
            {activeTab === "pos" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    POS Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoKotPrint"
                        checked={settings.autoKotPrint}
                        onChange={(e) =>
                          handleInputChange("autoKotPrint", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="autoKotPrint"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Auto-print KOT when order is placed
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoBillPrint"
                        checked={settings.autoBillPrint}
                        onChange={(e) =>
                          handleInputChange("autoBillPrint", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="autoBillPrint"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Auto-print bill when payment is completed
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roundOffBills"
                        checked={settings.roundOffBills}
                        onChange={(e) =>
                          handleInputChange("roundOffBills", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="roundOffBills"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Round off bill amounts to nearest rupee
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notification Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="orderNotifications"
                        checked={settings.orderNotifications}
                        onChange={(e) =>
                          handleInputChange(
                            "orderNotifications",
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="orderNotifications"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable order notifications
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="lowStockAlert"
                        checked={settings.lowStockAlert}
                        onChange={(e) =>
                          handleInputChange("lowStockAlert", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="lowStockAlert"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Enable low stock alerts
                      </label>
                    </div>

                    {settings.lowStockAlert && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Low Stock Threshold
                        </label>
                        <input
                          type="number"
                          value={settings.lowStockThreshold}
                          onChange={(e) =>
                            handleInputChange(
                              "lowStockThreshold",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Alert when stock falls below this number
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Social Media Links
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.facebook}
                        onChange={(e) =>
                          handleInputChange(
                            "socialMedia.facebook",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://facebook.com/yourcafe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.instagram}
                        onChange={(e) =>
                          handleInputChange(
                            "socialMedia.instagram",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://instagram.com/yourcafe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.twitter}
                        onChange={(e) =>
                          handleInputChange(
                            "socialMedia.twitter",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://twitter.com/yourcafe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={settings.socialMedia.whatsapp}
                        onChange={(e) =>
                          handleInputChange(
                            "socialMedia.whatsapp",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+91XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Google Maps Review
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Google Maps Review URL
                        </label>
                        <input
                          type="url"
                          value={settings.googleMapsReviewUrl}
                          onChange={(e) =>
                            handleInputChange(
                              "googleMapsReviewUrl",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://g.page/r/YOUR_PLACE_ID/review"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Get this URL from your Google My Business page.
                          Customers will be redirected here to leave reviews.
                        </p>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enableReviewRequest"
                          checked={settings.enableReviewRequest}
                          onChange={(e) =>
                            handleInputChange(
                              "enableReviewRequest",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="enableReviewRequest"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Ask customers to leave Google Maps reviews after
                          successful payment
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Theme Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primaryColor}
                          onChange={(e) =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.secondaryColor}
                          onChange={(e) =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-beige">
              <button
                type="submit"
                disabled={saving}
                className="bg-caramel-orange text-white px-8 py-3 rounded-xl hover:bg-dark-cocoa disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-300"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
