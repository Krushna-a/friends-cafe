import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const POSBilling = ({ selectedTable, onBack }) => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("pos_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("pos_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        onBack();
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.ok) {
        // Group products by their actual category
        const groupedProducts = {};

        response.data.products.forEach((product) => {
          const category = product.category || "Other";
          if (!groupedProducts[category]) {
            groupedProducts[category] = [];
          }
          groupedProducts[category].push(product);
        });

        setProducts(groupedProducts);

        // Set first category as active
        const firstCategory = Object.keys(groupedProducts)[0];
        if (firstCategory) {
          setActiveCategory(firstCategory);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Add/remove from favorites
  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const productId = product._id || product.id;
      const isAlreadyFavorite = prev.some(
        (fav) => (fav._id || fav.id) === productId,
      );
      if (isAlreadyFavorite) {
        return prev.filter((fav) => (fav._id || fav.id) !== productId);
      } else {
        return [...prev, product];
      }
    });
  };

  // Check if product is in favorites
  const isFavorite = (productId) => {
    return favorites.some((fav) => (fav._id || fav.id) === productId);
  };

  // Add item to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product._id || product.id;
      const existingItem = prevCart.find(
        (item) => (item._id || item.id) === productId,
      );
      if (existingItem) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  // Update quantity in cart
  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => (item._id || item.id) !== productId),
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          (item._id || item.id) === productId ? { ...item, qty: newQty } : item,
        ),
      );
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  };

  // Filter products based on search and category
  const getFilteredProducts = () => {
    if (activeCategory === "Favorites") {
      return favorites.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (!activeCategory || !products[activeCategory]) return [];

    return products[activeCategory].filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  // Handle payment and create order
  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Calculate subtotal
      const subtotal = calculateSubtotal();

      // Ensure all required fields are present and properly formatted
      const orderData = {
        items: cart.map((item) => ({
          name: item.name || "Unknown Item",
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.qty) || 1,
          itemTotal: parseFloat(item.price || 0) * parseInt(item.qty || 1),
        })),
        subtotal: parseFloat(subtotal),
        total: parseFloat(subtotal),
        finalAmount: parseFloat(subtotal),
        orderType: "pos",
        paymentMethod: paymentMethod || "Cash",
        tableNumber: selectedTable?.tableNumber?.toString() || "",
        isPosOrder: true,
        status: "paid",
      };

      console.log("=== ORDER CREATION DEBUG ===");
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);
      console.log("Token exists:", !!token);
      console.log("Token preview:", token.substring(0, 20) + "...");
      console.log("Order data:", JSON.stringify(orderData, null, 2));
      console.log("Cart items:", cart);
      console.log("Subtotal:", subtotal);
      console.log("Selected table:", selectedTable);

      // Test backend connectivity first
      console.log("Testing backend connectivity...");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        },
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data.ok) {
        toast.success(`Bill printed successfully! Payment: ${paymentMethod}`);
        setCart([]);

        setTimeout(() => {
          toast.info(
            `Order total: ₹${subtotal} | Table: ${selectedTable?.tableNumber || "N/A"}`,
          );
        }, 1000);
      } else {
        console.error("Response not OK:", response.data);
        throw new Error(response.data.error || "Failed to create order");
      }
    } catch (error) {
      console.error("=== ORDER CREATION ERROR ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Response headers:", error.response?.headers);
      console.error("Request config:", error.config);

      // Show detailed error message
      let errorMessage = "Failed to create order. Please try again.";

      if (error.code === "ECONNREFUSED") {
        errorMessage =
          "Cannot connect to server. Please check if backend is running.";
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || "Invalid order data.";
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.error || "Server error occurred.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(`Order creation failed: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 animate-pulse"></div>
          </div>
          <div className="text-amber-800 text-lg font-medium">
            Loading menu...
          </div>
          <div className="text-amber-600 text-sm mt-2">
            Preparing your café experience
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden fixed inset-0">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col bg-white rounded-lg m-2 lg:m-4 shadow-lg">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <button
                onClick={onBack}
                className="p-2 hover:bg-amber-500 rounded-xl transition-all duration-300 text-white hover:shadow-lg transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="text-white">
                <h2 className="text-lg font-semibold">
                  Table {selectedTable?.tableNumber || "N/A"}
                </h2>
                <p className="text-sm text-orange-100">POS Billing</p>
              </div>
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {Object.keys(products).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-white text-orange-500 shadow-md"
                    : "bg-orange-400 text-white hover:bg-orange-300"
                }`}
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => setActiveCategory("Favorites")}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === "Favorites"
                  ? "bg-white text-orange-500 shadow-md"
                  : "bg-orange-400 text-white hover:bg-orange-300"
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {getFilteredProducts().map((product) => (
              <div
                key={product._id || product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={
                      product.image ||
                      "https://via.placeholder.com/150x120?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150x120?text=No+Image";
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <div
                      className={`w-3 h-3 rounded-full ${product.inStock !== false ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm transition-all duration-200 hover:scale-110"
                  >
                    <svg
                      className={`w-4 h-4 transition-colors ${
                        isFavorite(product._id || product.id)
                          ? "text-red-500 fill-current"
                          : "text-gray-400"
                      }`}
                      fill={
                        isFavorite(product._id || product.id)
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold text-orange-600">
                    ₹ {product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Billing */}
      <div className="w-full lg:w-80 xl:w-96 bg-white rounded-lg m-2 lg:m-4 shadow-lg flex flex-col">
        {/* Billing Header */}
        <div className="p-4 lg:p-6 border-b bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg shadow-lg">
          <h2 className="text-xl font-bold text-amber-800">Café Billing</h2>
          <p className="text-sm text-amber-600 font-medium">
            Table {selectedTable?.tableNumber || "N/A"}
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
                />
              </svg>
              <p>No items in cart</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item._id || item.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/40x40?text=No+Image"
                      }
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/40x40?text=No+Image";
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-sm text-orange-600">₹ {item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item._id || item.id, item.qty - 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-orange-200 hover:bg-orange-300 rounded-full transition-colors"
                    >
                      <span className="text-lg font-bold text-orange-700">
                        -
                      </span>
                    </button>
                    <span className="w-8 text-center font-medium text-orange-700">
                      {item.qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item._id || item.id, item.qty + 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center bg-orange-200 hover:bg-orange-300 rounded-full transition-colors"
                    >
                      <span className="text-lg font-bold text-orange-700">
                        +
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing Summary */}
        {cart.length > 0 && (
          <div className="border-t p-4 lg:p-6 space-y-4 bg-orange-50 rounded-b-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-orange-600">₹ {calculateSubtotal()}</span>
            </div>

            {/* Payment Methods */}
            <div className="flex space-x-2">
              <button
                onClick={() => setPaymentMethod("Cash")}
                className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 ${
                  paymentMethod === "Cash"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:from-amber-200 hover:to-orange-200 hover:shadow-md"
                }`}
              >
                💵 Cash
              </button>
              <button
                onClick={() => setPaymentMethod("UPI")}
                className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 ${
                  paymentMethod === "UPI"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:from-amber-200 hover:to-orange-200 hover:shadow-md"
                }`}
              >
                📱 UPI
              </button>
              <button
                onClick={() => setPaymentMethod("Card")}
                className={`flex-1 py-3 px-3 rounded-xl font-semibold transition-all duration-300 ${
                  paymentMethod === "Card"
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg transform scale-105"
                    : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 hover:from-amber-200 hover:to-orange-200 hover:shadow-md"
                }`}
              >
                💳 Card
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Print Bill
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSBilling;
