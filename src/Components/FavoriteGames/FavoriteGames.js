import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";

const FavoriteGames = ({ isEditing }) => {
  const [favorites, setFavorites] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const apiUrl = "https://api.gameboxd.me/api/games";

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFavorites(userSnap.data().favoriteGames || []);
        }
      }
    };
    fetchFavorites();
  }, [user]);

  const searchGames = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}?search=${searchTerm}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Fetched games:", data);

      const filteredGames = data
        .filter((game) =>
          game.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

      setSearchResults(filteredGames);
    } catch (error) {
      console.error("Error searching games:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (game) => {
    if (user) {
      if (favorites.length >= 4) {
        alert("You can only add up to 4 favorite games.");
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const newFavorites = [...favorites, game];
      await updateDoc(userRef, { favoriteGames: newFavorites });
      setFavorites(newFavorites);
      setIsSearching(false);
      setSearchTerm("");
      setSearchResults([]);
    }
  };

  const removeFromFavorites = async (gameId) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const newFavorites = favorites.filter((game) => game.id !== gameId);
      await updateDoc(userRef, { favoriteGames: newFavorites });
      setFavorites(newFavorites);
    }
  };

  return (
    <div className="relative p-4 bg-gray-900 rounded-lg shadow">
      {isEditing && <div className="absolute inset-0 bg-transparent z-10" />}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {favorites.map((game) => (
          <div key={game.id} className="relative group">
            <Link href={`/games/${game.slug}`}>
              <img
                src={game.coverImageUrl}
                alt={game.name}
                className="w-full h-40 object-cover rounded-lg transition-transform duration-200 transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <p className="text-white text-sm font-semibold">{game.name}</p>
              </div>
            </Link>
            <button
              onClick={() => removeFromFavorites(game.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <FaTimes />
            </button>
          </div>
        ))}
        {favorites.length < 4 && (
          <button
            onClick={() => setIsSearching(true)}
            className="flex items-center justify-center w-full h-40 bg-gray-800 rounded-lg transition-colors duration-200 hover:bg-gray-700"
          >
            <FaPlus className="text-4xl text-blue-500" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-gray-800 p-4 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Search Games</h3>
                <button
                  onClick={() => {
                    setIsSearching(false);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                  className="text-white hover:text-red-500 transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchGames()}
                  className="flex-grow bg-gray-700 text-white border-none rounded-l px-2 py-1"
                  placeholder="Search..."
                />
                <button
                  onClick={searchGames}
                  className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600 transition-colors duration-200"
                >
                  <FaSearch />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                  <div className="text-white text-center">Loading...</div>
                ) : (
                  searchResults.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between mb-2 p-2 hover:bg-gray-700 rounded"
                    >
                      <span className="text-white">{game.name}</span>
                      <button
                        onClick={() => addToFavorites(game)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors duration-200"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteGames;
