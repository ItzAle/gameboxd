"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaSearch, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export default function EditCollectionPage({ collectionId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;
      const docRef = doc(db, "collections", collectionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setDescription(data.description);
        setGames(data.games || []);
        setHashtags(data.hashtags || []);
      }
      setIsLoading(false);
    };

    fetchCollection();
  }, [collectionId]);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch("https://api.gameboxd.me/api/games", {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAllGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, "collections", collectionId), {
        name,
        description,
        games,
        gameCount: games.length,
        hashtags,
        updatedAt: new Date(),
      });
      router.push(`/collections/${collectionId}`);
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await deleteDoc(doc(db, "collections", collectionId));
        router.push("/collections");
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filteredGames = allGames.filter(
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

    setSearchResults(filteredGames);
  }, [searchTerm, allGames]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const addGame = (game) => {
    if (!games.some((g) => g.id === game.id)) {
      setGames([...games, game]);
    }
    setSearchTerm("");
  };

  const removeGame = (gameId) => {
    setGames(games.filter((game) => game.id !== gameId));
  };

  const handleAddHashtag = (e) => {
    e.preventDefault();
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
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
      <TransparentNavbar />
      <div className="max-w-7xl mx-auto mt-24">
        <h1 className="text-3xl font-bold mb-8">Edit Collection</h1>
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded"
              rows="4"
            ></textarea>
          </div>

          {/* Hashtags input */}
          <div className="mb-4">
            <label htmlFor="hashtags" className="block mb-2">
              Hashtags
            </label>
            <div className="flex">
              <input
                type="text"
                id="hashtags"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                className="flex-grow p-2 bg-gray-700 rounded-l"
                placeholder="Enter a hashtag"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                <FaPlus />
              </button>
            </div>
            <div className="mt-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="ml-2 text-white font-bold"
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Game search */}
          <div className="mb-4">
            <label htmlFor="gameSearch" className="block mb-2">
              Search Games
            </label>
            <div className="flex">
              <input
                type="text"
                id="gameSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-2 bg-gray-700 rounded-l"
                placeholder="Search for games..."
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-r"
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Search Results</h3>
              <ul className="bg-gray-800 rounded p-2 max-h-60 overflow-y-auto">
                {searchResults.map((game) => (
                  <li
                    key={game.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-700"
                  >
                    <span>{game.name}</span>
                    <button
                      type="button"
                      onClick={() => addGame(game)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      <FaPlus />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Games in collection */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Games in Collection</h3>
            <ul className="bg-gray-800 rounded p-2">
              {games.map((game) => (
                <li
                  key={game.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-700"
                >
                  <span>{game.name}</span>
                  <button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Update Collection
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaTrash className="mr-2" /> Delete Collection
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
