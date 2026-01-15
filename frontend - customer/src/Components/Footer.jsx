import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faThLarge,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center transition ${
      isActive ? "text-orange-500 font-semibold" : "text-gray-500"
    }`;

  const iconClass = (isActive) =>
    `w-6 h-6 ${isActive ? "text-orange-500" : "text-gray-500"}`;

  return (
    <>
      {/* Policy Links Footer - Only on non-home pages */}
      <div className="bg-gray-100 border-t py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <Link
              to="/contact"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Contact Us
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-conditions"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/refund-policy"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Refund Policy
            </Link>
            <Link
              to="/disclaimer"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Disclaimer
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>
              © {new Date().getFullYear()} Friends Cafe. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 w-full bg-white border-t">
        <nav className="flex justify-around py-3">
          <NavLink to="/" className={linkClass}>
            {({ isActive }) => (
              <>
                <FontAwesomeIcon
                  icon={faHome}
                  className={iconClass(isActive)}
                />
                <span className="text-sm mt-1">Home</span>
              </>
            )}
          </NavLink>

          <NavLink to="/menu" className={linkClass}>
            {({ isActive }) => (
              <>
                <FontAwesomeIcon
                  icon={faThLarge}
                  className={iconClass(isActive)}
                />
                <span className="text-sm mt-1">Menu</span>
              </>
            )}
          </NavLink>

          <NavLink to="/orders" className={linkClass}>
            {({ isActive }) => (
              <>
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className={iconClass(isActive)}
                />
                <span className="text-sm mt-1">Orders</span>
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Footer;
