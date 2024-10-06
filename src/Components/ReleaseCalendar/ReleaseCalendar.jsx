"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaGamepad, FaChevronDown } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import "../../utils/customScrollbar.css";

const ReleaseCalendar = () => {
  const [allGames, setAllGames] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Cambiado para usar el año actual
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Cambiado para usar el mes actual
  const [isLoading, setIsLoading] = useState(true);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchAllGames = useCallback(async () => {
    try {
      const response = await fetch("https://api.gameboxd.me/api/games", {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all games:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeCalendar = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const games = await fetchAllGames();
        setAllGames(games);

        const years = [
          ...new Set(
            games.map((game) => new Date(game.releaseDate).getFullYear())
          ),
        ];
        const sortedYears = years.sort((a, b) => b - a);
        setAvailableYears(sortedYears);

        // Establecer el año actual si está disponible, de lo contrario, el último año disponible
        const currentYear = new Date().getFullYear();
        setSelectedYear(
          sortedYears.includes(currentYear) ? currentYear : sortedYears[0]
        );
      } catch (error) {
        setError("Failed to load games. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeCalendar();
  }, [fetchAllGames]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredGames = useMemo(() => {
    return allGames
      .filter((game) => {
        const releaseDate = new Date(game.releaseDate);
        return (
          releaseDate.getFullYear() === selectedYear &&
          releaseDate.getMonth() === selectedMonth
        );
      })
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [allGames, selectedYear, selectedMonth]);

  const GameCard = ({ game }) => (
    <Link href={`/games/${game.slug}`}>
      <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundImage: `url(${game.coverImageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <h3 className="font-semibold text-xl text-white mb-2">{game.name}</h3>
          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
            {game.description}
          </p>
          <div className="flex items-center text-sm text-gray-400 mb-2">
            <FaGamepad className="mr-1" />
            <span>{new Date(game.releaseDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const monthAbbreviations = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto mt-24 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Release Calendar</h1>
            <p className="text-xl text-gray-400 mt-2">
              {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>

          {/* Year selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              className="px-4 py-2 text-lg font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              {selectedYear} <FaChevronDown className="inline-block ml-2" />
            </button>
            <AnimatePresence>
              {isYearDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 right-0 mt-2 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto w-full"
                >
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      className="block w-full px-4 py-2 text-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => {
                        setSelectedYear(year);
                        setSelectedMonth(0); // Reset to January when changing year
                        setIsYearDropdownOpen(false);
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Month selector */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          {monthAbbreviations.map((month, index) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(index)}
              className={`px-4 py-2 mx-1 text-sm font-medium relative ${
                selectedMonth === index
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {month}
              {selectedMonth === index && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  layoutId="monthUnderline"
                />
              )}
            </button>
          ))}
        </div>

        {/* Games grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedYear}-${selectedMonth}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {filteredGames.length === 0 && (
              <p className="text-center text-gray-500 mt-8">
                No games released this month.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReleaseCalendar;
