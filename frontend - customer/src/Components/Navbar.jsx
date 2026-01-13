import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { cartCount, tableNumber } = useCart();
  const { user, setShowAuth, logout } = useUser();

  return (
    <header className="z-50 bg-white/95 backdrop-blur border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 max-w-7xl mx-auto">
        {/* Brand Section */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          <img
            src={logo}
            alt="Cafe Logo"
            className="h-10 w-10 rounded-md object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              Friends Café
            </span>
            <span className="text-xs text-gray-500">Scan • Order • Enjoy</span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Table Number */}
          {tableNumber && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <span>Table</span>
              <span className="text-sm font-bold">{tableNumber}</span>
            </div>
          )}

          {/* Cart */}
          <Link
            to="/orders"
            className="relative flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
                <span>👤</span>
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
