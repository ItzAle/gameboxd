"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import "../../utils/global.css";
import GoogleAdSense from "../Ads/GoogleAdSense";

export default function Component() {
  const [allGames, setAllGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [years, setYears] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const apiUrl = "https://gbxd-api.vercel.app/api/games";

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched games:", data);

      const sortedGames = data.sort(
        (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
      );

      setAllGames(sortedGames);
      setDisplayedGames(sortedGames);

      const uniqueYears = [
        ...new Set(
          data
            .map((game) => new Date(game.releaseDate).getFullYear())
            .filter((year) => !isNaN(year))
        ),
      ];
      const uniqueGenres = [
        ...new Set(data.flatMap((game) => game.genres || [])),
      ];

      setYears(uniqueYears.sort((a, b) => b - a));
      setGenres(uniqueGenres.sort());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const applyFilters = useCallback(() => {
    console.log("Applying filters. Current state:", {
      searchTerm,
      selectedYear,
      selectedGenre,
    });
    let filteredGames = allGames;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filteredGames = filteredGames.filter(
        (game) =>
          game.name.toLowerCase().includes(lowercasedTerm) ||
          (game.genres &&
            game.genres.some((genre) =>
              genre.toLowerCase().includes(lowercasedTerm)
            )) ||
          (game.platforms &&
            game.platforms.some((platform) =>
              platform.toLowerCase().includes(lowercasedTerm)
            ))
      );
    }

    if (selectedYear) {
      filteredGames = filteredGames.filter(
        (game) =>
          new Date(game.releaseDate).getFullYear() === parseInt(selectedYear)
      );
    }

    if (selectedGenre) {
      filteredGames = filteredGames.filter(
        (game) => game.genres && game.genres.includes(selectedGenre)
      );
    }

    console.log("Filtered games:", filteredGames); // Log filtered games
    setDisplayedGames(filteredGames);
  }, [allGames, searchTerm, selectedYear, selectedGenre]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, searchTerm, selectedYear, selectedGenre]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-red-500 text-xl bg-gray-800 p-6 rounded-lg shadow-lg">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <TransparentNavbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold text-center mb-12 text-blue-300"
          >
            Discover Games
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-4 max-w-2xl mx-auto mb-12"
          >
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search games"
                value={searchTerm}
                onChange={handleInputChange}
                className="flex-grow px-6 py-3 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            <motion.button
              onClick={toggleFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-300"
            >
              <Filter className="h-5 w-5" />
              <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            </motion.button>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex w-full space-x-4"
              >
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedGenre}
                  onChange={handleGenreChange}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </motion.div>
          <div className="mb-8">
            <GoogleAdSense
              client="ca-pub-3043119271393042"
              slot="REEMPLAZAR_CON_TU_SLOT"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
              >
                {displayedGames.length > 0 ? (
                  displayedGames.map((game) => (
                    <motion.div
                      key={game.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/games/${game.slug}`} className="group">
                        <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-gray-800 aspect-[3/4]">
                          {game.coverImageUrl ? (
                            <img
                              src={game.coverImageUrl}
                              alt={`${game.name} cover`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-500">
                              <Search className="h-12 w-12" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <h2 className="text-lg font-semibold line-clamp-2">
                              {game.name}
                            </h2>
                            {game.releaseDate && (
                              <p className="text-sm mt-1 text-gray-300">
                                Released:{" "}
                                {new Date(game.releaseDate).getFullYear()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-xl text-gray-400">
                    No games found matching your criteria.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
