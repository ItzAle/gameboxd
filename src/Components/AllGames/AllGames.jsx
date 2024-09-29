"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import "../../utils/global.css";
import GoogleAdSense from "../Ads/GoogleAdSense";

// Componentes memoizados
const MemoizedTransparentNavbar = React.memo(TransparentNavbar);
const MemoizedGoogleAdSense = React.memo(GoogleAdSense);

// Componente de juego memoizado
const GameCard = React.memo(({ game }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <Link href={`/games/${game.slug}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 bg-gray-800 aspect-[16/9]">
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
        <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-70 p-4">
          <h2 className="text-lg font-bold text-white line-clamp-1">
            {game.name}
          </h2>
          <div className="mt-1 text-sm text-gray-300">
            {game.releaseDate && (
              <p>Released: {new Date(game.releaseDate).toLocaleDateString()}</p>
            )}
            <p className="line-clamp-1">Genres: {game.genres?.join(", ")}</p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
));

GameCard.displayName = "GameCard";

export default function AllGames() {
  const [allGames, setAllGames] = useState([]);
  const [displayedGames, setDisplayedGames] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [years, setYears] = useState([]);
  const [genres, setGenres] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(12);
  const apiUrl = "https://api.gameboxd.me/api/games";

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const sortedGames = data.sort((a, b) => {
        const dateA = new Date(a.releaseDate);
        const dateB = new Date(b.releaseDate);
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      });

      setAllGames(sortedGames);

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
      const uniquePlatforms = [
        ...new Set(data.flatMap((game) => game.platforms || [])),
      ];

      setYears(uniqueYears.sort((a, b) => b - a));
      setGenres(uniqueGenres.sort());
      setPlatforms(uniquePlatforms.sort());
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
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

    if (selectedPlatform) {
      filteredGames = filteredGames.filter(
        (game) => game.platforms && game.platforms.includes(selectedPlatform)
      );
    }

    setDisplayedGames(filteredGames);
    setCurrentPage(1);
  }, [allGames, searchTerm, selectedYear, selectedGenre, selectedPlatform]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const currentGames = useMemo(() => {
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    return displayedGames.slice(indexOfFirstGame, indexOfLastGame);
  }, [currentPage, displayedGames, gamesPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(displayedGames.length / gamesPerPage),
    [displayedGames, gamesPerPage]
  );

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleYearChange = useCallback((event) => {
    setSelectedYear(event.target.value);
  }, []);

  const handleGenreChange = useCallback((event) => {
    setSelectedGenre(event.target.value);
  }, []);

  const handlePlatformChange = useCallback((event) => {
    setSelectedPlatform(event.target.value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedYear("");
    setSelectedGenre("");
    setSelectedPlatform("");
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
      <MemoizedTransparentNavbar />
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
          className="flex flex-col items-center space-y-4 max-w-4xl mx-auto mb-12"
        >
          <div className="flex w-full space-x-4">
            <input
              type="text"
              placeholder="Search games"
              value={searchTerm}
              onChange={handleInputChange}
              className="flex-grow px-6 py-3 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="flex flex-wrap w-full space-x-4 space-y-4">
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
            <select
              value={selectedPlatform}
              onChange={handlePlatformChange}
              className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300"
            >
              <X className="h-5 w-5" />
              <span>Clear Filters</span>
            </motion.button>
          </div>
        </motion.div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-white" />
          </div>
        ) : (
          <>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {currentGames.map((game) => (
                  <GameCard key={game.slug} game={game} />
                ))}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
              >
                <ChevronLeft />
              </button>
              <span className="px-4 py-2 bg-gray-700 text-white rounded-full">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
