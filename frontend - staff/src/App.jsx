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
import Edit from "./pages/Edit";
import { FullScreenProvider, useFullScreen } from "./context/FullScreenContext";

const AppLayout = () => {
  const { isFullScreen } = useFullScreen();

  return (
    <>
      {!isFullScreen && <Navbar />}
      <div className="w-full flex">
        {!isFullScreen && <Sidebar />}
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
            <Route path="/" element={<Navigate to="/list" replace />} />
          </Routes>
        </div>
      </div>
      {!isFullScreen && <Footer />}
    </>
  );
};

const App = () => (
  <FullScreenProvider>
    <AppLayout />
  </FullScreenProvider>
);

export default App;
