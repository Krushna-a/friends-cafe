import { useSettings } from "../hooks/useSettings";

const Navbar = () => {
  const { settings } = useSettings();

  return (
    <div className="flex justify-between items-center shadow-lg bg-clean-white">
      <div>
        <img
          className="h-18 p-3"
          src={
            settings.logo ||
            "https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
          }
          alt={settings.cafeName || "Cafe Logo"}
        />
      </div>
    </div>
  );
};

export default Navbar;
