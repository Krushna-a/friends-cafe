import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Orders from "./Pages/Orders";
import Checkout from "./Pages/Checkout";
import Invoice from "./Pages/Invoice";
import { CartProvider, useCart } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import CartBar from "./Components/CartBar";
import CartModal from "./Components/CartModal";
import AuthModal from "./Components/AuthModal";

const AppLayout = () => {
  const { cartCount, cartTotal } = useCart();
  const [showCart, setShowCart] = React.useState(false);
  const location = useLocation();

  // Hide CartBar on checkout page
  const showCartBar = location.pathname !== "/checkout";

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/menu" element={<Menu />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/invoice/:orderId" element={<Invoice />} />
      </Routes>

      <Footer />

      {showCartBar && (
        <CartBar
          cartCount={cartCount}
          total={cartTotal}
          onOpenCart={() => setShowCart(true)}
        />
      )}
      <CartModal open={showCart} onClose={() => setShowCart(false)} />
      <AuthModal />
    </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <CartProvider>
        <Routes>
          {/* Home Page Only (No Navbar, No Footer) */}
          <Route path="/" element={<Home />} />

          {/* All Other Pages With Layout */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </UserProvider>
  );
};

export default App;
