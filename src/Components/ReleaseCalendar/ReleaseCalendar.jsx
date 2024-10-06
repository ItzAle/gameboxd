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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(true);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const [selectedView, setSelectedView] = useState("calendar"); // New state for view selection

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

  const thisWeekGames = useMemo(() => {
    const today = new Date();
    const endOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    return allGames
      .filter((game) => {
        const releaseDate = new Date(game.releaseDate);
        return releaseDate >= today && releaseDate < endOfWeek;
      })
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [allGames]);

  const nextWeekGames = useMemo(() => {
    const today = new Date();
    const startOfNextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 7
    );
    const endOfNextWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 14
    );
    return allGames
      .filter((game) => {
        const releaseDate = new Date(game.releaseDate);
        return releaseDate >= startOfNextWeek && releaseDate < endOfNextWeek;
      })
      .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [allGames]);

  const last30DaysGames = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 30
    );
    return allGames
      .filter((game) => {
        const releaseDate = new Date(game.releaseDate);
        return releaseDate >= thirtyDaysAgo && releaseDate <= today;
      })
      .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }, [allGames]);

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

  const renderGames = (games) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );

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
              {selectedView === "calendar"
                ? `${months[selectedMonth]} ${selectedYear}`
                : ""}
            </p>
          </div>

          {/* Year selector dropdown */}
          {selectedView === "calendar" && (
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
                          setSelectedMonth(0);
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
          )}
        </div>

        {/* View selector */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <button
            onClick={() => setSelectedView("calendar")}
            className={`px-4 py-2 mx-1 text-sm font-medium relative ${
              selectedView === "calendar"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Calendar
            {selectedView === "calendar" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="viewUnderline"
              />
            )}
          </button>
          <button
            onClick={() => setSelectedView("thisWeek")}
            className={`px-4 py-2 mx-1 text-sm font-medium relative ${
              selectedView === "thisWeek"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            This Week
            {selectedView === "thisWeek" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="viewUnderline"
              />
            )}
          </button>
          <button
            onClick={() => setSelectedView("nextWeek")}
            className={`px-4 py-2 mx-1 text-sm font-medium relative ${
              selectedView === "nextWeek"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Next Week
            {selectedView === "nextWeek" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="viewUnderline"
              />
            )}
          </button>
          <button
            onClick={() => setSelectedView("last30Days")}
            className={`px-4 py-2 mx-1 text-sm font-medium relative ${
              selectedView === "last30Days"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Last 30 Days
            {selectedView === "last30Days" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="viewUnderline"
              />
            )}
          </button>
        </div>

        {/* Month selector (only for calendar view) */}
        {selectedView === "calendar" && (
          <div className="flex justify-center mb-8 overflow-x-auto">
            {months.map((month, index) => (
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
        )}

        {/* Games grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedView}-${selectedYear}-${selectedMonth}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedView === "calendar" && renderGames(filteredGames)}
            {selectedView === "thisWeek" && renderGames(thisWeekGames)}
            {selectedView === "nextWeek" && renderGames(nextWeekGames)}
            {selectedView === "last30Days" && renderGames(last30DaysGames)}

            {selectedView === "calendar" && filteredGames.length === 0 && (
              <p className="text-center text-gray-500 mt-8">
                No games released this month.
              </p>
            )}
            {selectedView === "thisWeek" && thisWeekGames.length === 0 && (
              <p className="text-center text-gray-500 mt-8">
                No games releasing this week.
              </p>
            )}
            {selectedView === "nextWeek" && nextWeekGames.length === 0 && (
              <p className="text-center text-gray-500 mt-8">
                No games releasing next week.
              </p>
            )}
            {selectedView === "last30Days" && last30DaysGames.length === 0 && (
              <p className="text-center text-gray-500 mt-8">
                No games released in the last 30 days.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ReleaseCalendar;
