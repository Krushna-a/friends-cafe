import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center shadow-lg">
      <div className="">
        <img className="h-18 p-3" src="https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg" alt="" />
      </div>
      <div onClick={handleLogout} className="px-7 py-2 mr-10 border bg-black text-white hover:rounded-full">Logout</div>
    </div>
  );
};

export default Navbar;
