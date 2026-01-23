import React from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { cartCount, tableNumber } = useCart();
  const { user, setShowAuth, logout } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-[#EFE6D8]/95 backdrop-blur border-b border-[#6F4E37]/20">
      <div className="flex items-center justify-between px-3 py-2 sm:px-5 max-w-7xl mx-auto">
        
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition"
        >
          <img
            src={logo}
            alt="Cafe Logo"
            className="h-8 w-8 rounded-md object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-[#3B2A1F]">
              Friends Café
            </span>
            <span className="text-[11px] text-[#6F4E37]/70">
              Scan • Order • Enjoy
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Table */}
          {tableNumber && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-[#6F4E37]/10 px-3 py-1 text-xs font-semibold text-[#6F4E37]">
              <span>Table</span>
              <span className="font-bold">{tableNumber}</span>
            </div>
          )}

          {/* Cart */}
          <Link
            to="/orders"
            className="relative flex items-center gap-1.5 rounded-full bg-[#6F4E37] px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3B2A1F] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1 rounded-full bg-[#F6EFE6] px-3 py-1 text-xs font-medium text-[#3B2A1F]">
                <span>👤</span>
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-full border border-[#6F4E37]/30 bg-transparent px-3 py-1 text-xs font-semibold text-[#6F4E37] hover:bg-[#6F4E37]/10 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-full border border-[#6F4E37]/30 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#6F4E37] hover:bg-[#6F4E37]/10 transition"
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
