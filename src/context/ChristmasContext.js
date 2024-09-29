import React, { createContext, useState, useEffect, useContext } from "react";

const ChristmasContext = createContext();

export const ChristmasProvider = ({ children }) => {
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  const [isNewYear, setIsNewYear] = useState(false);

  useEffect(() => {
    const checkChristmasSeason = () => {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 11, 1); // 1 de noviembre
      const endDate = new Date(now.getFullYear() + 1, 0, 6); // 6 de enero del próximo año

      return now >= startDate && now <= endDate;
    };

    const checkNewYear = () => {
      const now = new Date();
      return now.getMonth() === 0 && now.getDate() === 1;
    };

    setIsChristmasMode(checkChristmasSeason());
    setIsNewYear(checkNewYear());

    const interval = setInterval(() => {
      setIsChristmasMode(checkChristmasSeason());
      setIsNewYear(checkNewYear());
    }, 60000); // Comprobar cada minuto

    return () => clearInterval(interval);
  }, []);

  const toggleChristmasMode = () => {
    setIsChristmasMode((prev) => !prev);
  };

  return (
    <ChristmasContext.Provider
      value={{ isChristmasMode, toggleChristmasMode, isNewYear }}
    >
      {children}
    </ChristmasContext.Provider>
  );
};

export const useChristmas = () => useContext(ChristmasContext);
