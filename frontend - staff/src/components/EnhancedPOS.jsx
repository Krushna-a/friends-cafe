import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Receipt from "./Receipt";

const EnhancedPOS = ({ selectedTable, onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Favorites");
  const [searchTerm, setSearchTerm] = useState("");
  const [shortcodeInput, setShortcodeInput] = useState("");
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Billing options
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [splitBill, setSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [orderNotes, setOrderNotes] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    mobile: "",
    email: "",
    gst: "",
  });

  // Special features
  const [kotPrinted, setKotPrinted] = useState(false);
  const [billHold, setBillHold] = useState(false);
  const [complimentary, setComplimentary] = useState(false);

  const shortcodeRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchFavoriteItems();
  }, []);

  // Focus shortcode input on mount
  useEffect(() => {
    if (shortcodeRef.current) {
      shortcodeRef.current.focus();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
      );

      if (response.data.products) {
        const availableProducts = response.data.products.filter(
          (p) => p.inStock !== false,
        );

        // Add shortcodes to products (mock implementation)
        const productsWithShortcodes = availableProducts.map(
          (product, index) => ({
            ...product,
            shortcode: `${index + 1}`,
            alphaCode: product.name.substring(0, 3).toUpperCase(),
          }),
        );

        setProducts(productsWithShortcodes);

        const uniqueCategories = [
          "Favorites",
          "All Menu",
          ...new Set(availableProducts.map((p) => p.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteItems = () => {
    // Mock favorite items (most sold items)
    const favorites = products.slice(0, 8);
    setFavoriteItems(favorites);
  };

  const handleShortcodeInput = (e) => {
    const value = e.target.value;
    setShortcodeInput(value);

    if (e.key === "Enter" && value) {
      const product = products.find(
        (p) =>
          p.shortcode === value ||
          p.alphaCode.toLowerCase() === value.toLowerCase(),
      );

      if (product) {
        addToCart(product);
        setShortcodeInput("");
      } else {
        toast.error("Invalid shortcode");
      }
    }
  };

  const filteredProducts = () => {
    if (selectedCategory === "Favorites") {
      return favoriteItems;
    } else if (selectedCategory === "All Menu") {
      return products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } else {
      return products.filter(
        (product) =>
          product.category === selectedCategory &&
          product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity, notes: "" }]);
    }
    toast.success(`${product.name} added to cart`, { autoClose: 1000 });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const updateItemNotes = (productId, notes) => {
    setCart(
      cart.map((item) => (item._id === productId ? { ...item, notes } : item)),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item._id !== productId));
    toast.info("Item removed from cart", { autoClose: 1000 });
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes("");
    setDiscountValue(0);
    setPaymentMethods([]);
    toast.info("Cart cleared");
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const taxRate = 0.18; // 18% GST
  const taxAmount = subtotal * taxRate;

  const discountAmount =
    discountType === "fixed"
      ? Math.min(discountValue, subtotal)
      : (subtotal * discountValue) / 100;

  const total = complimentary ? 0 : subtotal + taxAmount - discountAmount;

  const printKOT = () => {
    // Mock KOT printing
    console.log("Printing KOT for Table:", selectedTable.tableNumber);
    console.log("Items:", cart);
    setKotPrinted(true);
    toast.success("KOT sent to kitchen");
  };

  const addPaymentMethod = (method, amount) => {
    setPaymentMethods([...paymentMethods, { method, amount }]);
  };

  const getTotalPaid = () => {
    return paymentMethods.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getChangeAmount = () => {
    const totalPaid = getTotalPaid();
    return totalPaid > total ? totalPaid - total : 0;
  };

  const validateOrder = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }

    // Remove KOT requirement for direct order placement
    // if (!kotPrinted && !complimentary) {
    //   toast.error("Please print KOT first");
    //   return false;
    // }

    if (!complimentary && paymentMethods.length === 0) {
      // Auto-add cash payment for the total amount
      setPaymentMethods([{ method: "cash", amount: total }]);
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateOrder()) return;

    setProcessingOrder(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/");
        return;
      }

      // Get admin user info from token
      let adminUserId = "staff";
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        adminUserId = payload.id || "staff";
      } catch (e) {
        console.log("Could not decode token, using default admin ID");
      }

      const customOrderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const orderData = {
        customOrderId,
        customerName: "", // Don't send customer name for POS orders
        customerMobile: "",
        tableNumber: selectedTable.tableNumber,
        orderType: "pos", // Mark as POS order

        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specialInstructions: item.notes || "",
          itemTotal: item.price * item.quantity,
          isComplimentary: complimentary,
          kotPrinted: kotPrinted,
        })),

        subtotal: parseFloat(subtotal.toFixed(2)),

        taxes: [
          {
            name: "GST",
            rate: taxRate * 100,
            amount: parseFloat(taxAmount.toFixed(2)),
          },
        ],
        totalTax: parseFloat(taxAmount.toFixed(2)),

        discounts:
          discountAmount > 0
            ? [
                {
                  type: discountType,
                  value: discountValue,
                  amount: parseFloat(discountAmount.toFixed(2)),
                  reason: "Manual discount",
                  appliedBy: adminUserId,
                },
              ]
            : [],
        totalDiscount: parseFloat(discountAmount.toFixed(2)),

        total: parseFloat(total.toFixed(2)),
        finalAmount: parseFloat(total.toFixed(2)),

        payments: paymentMethods.map((payment) => ({
          method: payment.method,
          amount: payment.amount,
          paidAt: new Date(),
        })),
        totalPaid: getTotalPaid(),
        balanceAmount: Math.max(0, total - getTotalPaid()),

        status: complimentary
          ? "served"
          : getTotalPaid() >= total
            ? "paid"
            : "confirmed",
        isComplimentary: complimentary,
        kotPrinted: kotPrinted,
        kotPrintedAt: kotPrinted ? new Date() : undefined,

        createdBy: adminUserId,
        notes: orderNotes,

        orderTime: new Date(),
        confirmedAt: new Date(),
        paidAt: getTotalPaid() >= total ? new Date() : undefined,
      };

      console.log("Sending enhanced POS order data:", orderData);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/pos/orders`,
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.ok) {
        const order = response.data.order;
        toast.success(`Order ${customOrderId} placed successfully!`);

        setShowReceipt({
          order: {
            ...order,
            customOrderId,
            items: cart,
            subtotal,
            taxAmount,
            discount: discountAmount,
            total,
            tableNumber: selectedTable.tableNumber,
            paymentMethods,
            changeAmount: getChangeAmount(),
          },
          user: customerInfo,
        });

        clearCart();
      }
    } catch (error) {
      console.error("Error placing enhanced POS order:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.error || "Failed to place order");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Table {selectedTable.tableNumber}
                  </h1>
                  <p className="text-sm text-gray-500">POS Billing System</p>
                </div>
              </div>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Shortcode Input - Hidden on mobile */}
                <div className="hidden md:block relative">
                  <input
                    ref={shortcodeRef}
                    type="text"
                    placeholder="Enter shortcode..."
                    value={shortcodeInput}
                    onChange={(e) => setShortcodeInput(e.target.value)}
                    onKeyPress={handleShortcodeInput}
                    className="w-36 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="absolute right-3 top-2.5 text-gray-400 text-xs">
                    F2
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={printKOT}
                    disabled={cart.length === 0 || kotPrinted}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {kotPrinted ? "KOT Printed" : "Print KOT"}
                  </button>

                  <button
                    onClick={() => setBillHold(!billHold)}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      billHold
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {billHold ? "On Hold" : "Hold"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Menu Section */}
          <div className="flex-1 p-4 lg:p-6">
            {/* Category Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Bar (only for non-favorites) */}
            {selectedCategory !== "Favorites" && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts().map((product) => (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 group"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zM5 7v11h14V7H5z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  <div className="flex justify-between items-center">
                    <p className="text-blue-600 font-semibold text-sm">
                      ₹{product.price}
                    </p>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {product.shortcode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Panel */}
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
            {/* Order Header */}
            <div className="p-4 lg:p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Order
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setComplimentary(!complimentary)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      complimentary
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Complimentary
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Order Type Info */}
              <div className="space-y-3">
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-800">
                    POS Order - Table {selectedTable.tableNumber}
                  </div>
                  <div className="text-blue-600 text-xs mt-1">
                    Walk-in customer billing
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🛒</div>
                  <p>No items added</p>
                  <p className="text-sm mt-2">
                    Use shortcodes or click items to add
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item._id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            ₹{item.price} × {item.quantity} = ₹
                            {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-6 h-6 rounded bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-sm ml-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Item Notes */}
                      <input
                        type="text"
                        placeholder="Special instructions..."
                        value={item.notes}
                        onChange={(e) =>
                          updateItemNotes(item._id, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary & Payment */}
            <div className="border-t p-4">
              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%):</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span
                    className={
                      complimentary ? "text-purple-600" : "text-green-600"
                    }
                  >
                    {complimentary ? "COMPLIMENTARY" : `₹${total.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowDiscount(!showDiscount)}
                    className="flex-1 py-2 px-3 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    Discount
                  </button>
                  <button
                    onClick={() => setSplitBill(!splitBill)}
                    className="flex-1 py-2 px-3 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    Split Bill
                  </button>
                </div>

                {/* Discount Section */}
                {showDiscount && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="flex space-x-2 mb-2">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) =>
                          setDiscountValue(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                {!complimentary && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addPaymentMethod("cash", total)}
                        className="flex-1 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => addPaymentMethod("card", total)}
                        className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                      >
                        Card
                      </button>
                      <button
                        onClick={() => addPaymentMethod("upi", total)}
                        className="flex-1 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
                      >
                        UPI
                      </button>
                    </div>

                    {paymentMethods.length > 0 && (
                      <div className="text-xs space-y-1">
                        {paymentMethods.map((payment, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{payment.method.toUpperCase()}:</span>
                            <span>₹{payment.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        {getChangeAmount() > 0 && (
                          <div className="flex justify-between font-bold text-green-600">
                            <span>Change:</span>
                            <span>₹{getChangeAmount().toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  onClick={placeOrder}
                  disabled={cart.length === 0 || processingOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  {processingOrder ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </div>
                  ) : (
                    "Settle Bill"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <Receipt
          order={showReceipt.order}
          user={showReceipt.user}
          onClose={() => setShowReceipt(null)}
          showDiscount={true}
        />
      )}
    </div>
  );
};

export default EnhancedPOS;
