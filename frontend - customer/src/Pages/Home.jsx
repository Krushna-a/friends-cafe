import React, { useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import bgImage from "../assets/background.jpg";
import logo from "../assets/logo.png";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if there's a table parameter in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tableNumber = params.get("table");

    // If there's a table parameter, redirect to menu with the table parameter
    if (tableNumber) {
      console.log(`QR Code scanned for table: ${tableNumber}`);
      navigate(`/menu?table=${tableNumber}`, { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="relative min-h-screen">
      {/* Blurred Background Image */}
      <img
        src={bgImage}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover blur-[1px]"
      />

      {/* Content on top (not blurred) */}
      <div className="relative z-10 h-full w-full flex items-center justify-center top-50">
        <div className="bg-clean-white/90 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center ">
          <img src={logo} alt="logo" className="h-30" />
          <h1 className="text-lg sm:text-2xl font-bold text-dark-cocoa">
            #FCC FRIENDS CLUB CAFE
          </h1>
          <NavLink
            to="/menu"
            className="mt-4 bg-caramel-orange text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-dark-cocoa transition-colors"
          >
            Order Now →
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Home;
