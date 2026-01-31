import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListCheck,
  faList,
  faUsers,
  faChartLine,
  faCashRegister,
  faHeadset,
  faGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItem =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-muted-brown hover:bg-beige transition";

  const activeNav =
    "flex items-center gap-3 px-4 py-2 rounded-full bg-coffee-brown text-white";

  return (
    <div className="w-54 h-screen bg-clean-white border-r border-beige flex flex-col justify-between px-4 py-6">
      {/* Top Section */}
      <div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/pos"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faCashRegister} />
            <span>POS Terminal</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faListCheck} />
            <span>Order History</span>
          </NavLink>

          <NavLink
            to="/list"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faList} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faChartLine} />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Customers</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? activeNav : navItem)}
          >
            <FontAwesomeIcon icon={faGear} />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2">
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-brown hover:bg-beige">
          <FontAwesomeIcon icon={faHeadset} />
          <span>Support</span>
        </button>

        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-caramel-orange hover:bg-caramel-orange/10">
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>Clock Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;