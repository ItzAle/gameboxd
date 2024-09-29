import React, { createContext, useState, useEffect, useContext } from "react";

const HalloweenContext = createContext();

export const HalloweenProvider = ({ children }) => {
  const [isHalloweenMode, setIsHalloweenMode] = useState(false);

  useEffect(() => {
    const checkHalloweenSeason = () => {
      const now = new Date();
      // Cambiamos la fecha de inicio al 29 de septiembre para pruebas
      const startDate = new Date(now.getFullYear(), 9, 1); // tener en cuenta que enero es 0
      const endDate = new Date(now.getFullYear() + 11, 1); // 1 de enero del próximo año

      return now >= startDate && now < endDate;
    };

    setIsHalloweenMode(checkHalloweenSeason());
  }, []);

  const toggleHalloweenMode = () => {
    setIsHalloweenMode((prev) => !prev);
  };

  return (
    <HalloweenContext.Provider value={{ isHalloweenMode, toggleHalloweenMode }}>
      {children}
    </HalloweenContext.Provider>
  );
};

export const useHalloween = () => useContext(HalloweenContext);
