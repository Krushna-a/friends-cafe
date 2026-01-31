import { NavLink, Link } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const Footer = () => {
  const { settings } = useSettings();

  // Modern minimalist SVG Icons
  const HomeIcon = ({ isActive }) => (
    <svg
      className={`w-6 h-6 transition-colors duration-300 ${
        isActive ? "text-coffee-brown" : "text-muted-brown"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );

  const MenuIcon = ({ isActive }) => (
    <svg
      className={`w-6 h-6 transition-colors duration-300 ${
        isActive ? "text-coffee-brown" : "text-muted-brown"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );

  const OrdersIcon = ({ isActive }) => (
    <svg
      className={`w-6 h-6 transition-colors duration-300 ${
        isActive ? "text-coffee-brown" : "text-muted-brown"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <>
      {/* Policy Links Footer - Warm Beige Theme */}
      <div className="bg-beige border-t border-coffee-brown/20 py-2 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <Link
              to="/contact"
              className="text-coffee-brown hover:text-dark-cocoa transition-colors duration-200"
            >
              Contact Us
            </Link>
            <Link
              to="/privacy-policy"
              className="text-coffee-brown hover:text-dark-cocoa transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-conditions"
              className="text-coffee-brown hover:text-dark-cocoa transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/refund-policy"
              className="text-coffee-brown hover:text-dark-cocoa transition-colors duration-200"
            >
              Refund Policy
            </Link>
            <Link
              to="/disclaimer"
              className="text-coffee-brown hover:text-dark-cocoa transition-colors duration-200"
            >
              Disclaimer
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-coffee-brown/20 text-center text-xs text-muted-brown">
            <p>
              © {new Date().getFullYear()} {settings.cafeName}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Glassmorphism Bottom Navigation - Floating Pill Design */}
      <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 ">
        <div
          className="
            backdrop-blur-xl bg-clean-white/20 
            border border-clean-white/30 
            rounded-full 
            shadow-2xl shadow-black/10
            px-8
            min-w-[280px]
          "
          style={{
            backdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.15)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <nav className="flex justify-around items-center">
            <NavLink
              to="/"
              className="flex flex-col items-center transition-all duration-300 hover:scale-105 px-4 py-1"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                    p-1 rounded-xl transition-all duration-300 
                    ${
                      isActive
                        ? "bg-coffee-brown/20 shadow-lg shadow-coffee-brown/20"
                        : "hover:bg-clean-white/10"
                    }
                  `}
                  >
                    <HomeIcon isActive={isActive} />
                  </div>
                  <span
                    className={`
                      text-xs mt-1 font-medium transition-colors duration-300 
                      ${
                        isActive
                          ? "text-coffee-brown font-semibold"
                          : "text-muted-brown"
                      }
                    `}
                  >
                    Home
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/menu"
              className="flex flex-col items-center transition-all duration-300 hover:scale-105 px-4 py-2"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                    p-2 rounded-xl transition-all duration-300 
                    ${
                      isActive
                        ? "bg-coffee-brown/20 shadow-lg shadow-coffee-brown/20"
                        : "hover:bg-clean-white/10"
                    }
                  `}
                  >
                    <MenuIcon isActive={isActive} />
                  </div>
                  <span
                    className={`
                      text-xs mt-1 font-medium transition-colors duration-300 
                      ${
                        isActive
                          ? "text-coffee-brown font-semibold"
                          : "text-muted-brown"
                      }
                    `}
                  >
                    Menu
                  </span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/orders"
              className="flex flex-col items-center transition-all duration-300 hover:scale-105 px-4 py-2"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`
                    p-2 rounded-xl transition-all duration-300 
                    ${
                      isActive
                        ? "bg-coffee-brown/20 shadow-lg shadow-coffee-brown/20"
                        : "hover:bg-clean-white/10"
                    }
                  `}
                  >
                    <OrdersIcon isActive={isActive} />
                  </div>
                  <span
                    className={`
                      text-xs mt-1 font-medium transition-colors duration-300 
                      ${
                        isActive
                          ? "text-coffee-brown font-semibold"
                          : "text-muted-brown"
                      }
                    `}
                  >
                    Orders
                  </span>
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed footer */}
      <div className="h-24"></div>
    </>
  );
};

export default Footer;
