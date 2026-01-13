import React from "react";
import { NavLink } from "react-router-dom";
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
    <div className="sticky bottom-0 w-full bg-white border-t">
      <nav className="flex justify-around py-3">
        <NavLink to="/" className={linkClass}>
          {({ isActive }) => (
            <>
              <FontAwesomeIcon icon={faHome} className={iconClass(isActive)} />
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
  );
};

export default Footer;
