import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Stats from "./pages/Stats";
import POS from "./pages/POS";
import Settings from "./pages/Settings";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Edit from "./pages/Edit";
import { FullScreenProvider, useFullScreen } from "./context/FullScreenContext";

// Main App Layout Component
const AppLayout = ({ setIsAuthenticated }) => {
  const { isFullScreen } = useFullScreen();

  return (
    <>
      {/* Hide navbar in full screen mode */}
      {!isFullScreen && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <div className="w-full flex">
        {/* Hide sidebar in full screen mode */}
        {!isFullScreen && (
          <div className="">
            <Sidebar />
          </div>
        )}

        <div
          className={`${isFullScreen ? "w-full" : "w-full flex justify-center"}`}
        >
          <Routes>
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/edit/:id" element={<Edit />} />
          </Routes>
        </div>
      </div>

      {/* Hide footer in full screen mode */}
      {!isFullScreen && <Footer />}
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("adminToken");
    return !!token;
  });

  return (
    <FullScreenProvider>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate to="/list" replace />
              )
            }
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AppLayout setIsAuthenticated={setIsAuthenticated} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </FullScreenProvider>
  );
};

export default App;
