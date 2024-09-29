import React, { createContext, useState, useEffect, useContext } from "react";

const HalloweenContext = createContext();

export const HalloweenProvider = ({ children }) => {
  const [isHalloweenMode, setIsHalloweenMode] = useState(false);
  const [isNewYear, setIsNewYear] = useState(false);

  useEffect(() => {
    const checkHalloweenSeason = () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 9, 1); // 1 de noviembre
      const endDate = new Date(now.getFullYear(), 10, 1);

      return now >= startDate && now <= endDate;
    };

    const checkNewYear = () => {
      const now = new Date();
      return now.getMonth() === 0 && now.getDate() === 1;
    };

    setIsHalloweenMode(checkHalloweenSeason());
    setIsNewYear(checkNewYear());

    const interval = setInterval(() => {
      setIsHalloweenMode(checkHalloweenSeason());
      setIsNewYear(checkNewYear());
    }, 60000); // Comprobar cada minuto

    return () => clearInterval(interval);
  }, []);

  const toggleHalloweenMode = () => {
    setIsHalloweenMode((prev) => !prev);
  };

  return (
    <HalloweenContext.Provider
      value={{ isHalloweenMode, toggleHalloweenMode, isNewYear }}
    >
      {children}
    </HalloweenContext.Provider>
  );
};

export const useHalloween = () => useContext(HalloweenContext);
