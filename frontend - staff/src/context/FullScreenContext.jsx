import { createContext, useContext, useState } from "react";

const FullScreenContext = createContext();

export const useFullScreen = () => {
  const context = useContext(FullScreenContext);
  if (!context) {
    throw new Error("useFullScreen must be used within a FullScreenProvider");
  }
  return context;
};

export const FullScreenProvider = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const enterFullScreen = () => setIsFullScreen(true);
  const exitFullScreen = () => setIsFullScreen(false);

  return (
    <FullScreenContext.Provider
      value={{
        isFullScreen,
        enterFullScreen,
        exitFullScreen,
      }}
    >
      {children}
    </FullScreenContext.Provider>
  );
};
