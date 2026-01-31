import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center shadow-lg bg-clean-white">
      <div className="">
        <img
          className="h-18 p-3"
          src={
            settings.logo ||
            "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
          }
          alt={settings.cafeName || "Cafe Logo"}
        />
      </div>
      <div
        onClick={handleLogout}
        className="px-7 py-2 mr-10 border border-coffee-brown bg-caramel-orange text-white hover:bg-dark-cocoa hover:rounded-full cursor-pointer transition-all"
      >
        Logout
      </div>
    </div>
  );
};

export default Navbar;
