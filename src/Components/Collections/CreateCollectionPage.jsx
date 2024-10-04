"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export default function CreateCollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [games, setGames] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
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
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUsername(
              userDoc.data().username || user.displayName || "Usuario"
            );
          } else {
            setUsername(user.displayName || "Usuario");
          }
        } catch (error) {
          setUsername(user.displayName || "Usuario");
        }
      }
    };

    fetchUsername();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, "collections"), {
        userId: user.uid,
        creatorName: username,
        name,
        description,
        games,
        gameCount: games.length,
        hashtags,
        followers: [],
        followerCount: 0,
        createdAt: new Date(),
      });
      router.push(`/collections/${docRef.id}`);
    } catch (error) {
    }
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
    setSearchResults([]);
    setSearchTerm("");
  };

  const removeGame = (gameId) => {
    setGames(games.filter((game) => game.id !== gameId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8"
    >
      <TransparentNavbar />
      <div className="max-w-7xl mx-auto mt-24">
        <h1 className="text-3xl font-bold mb-8">Create New Collection</h1>
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

          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Search Results</h3>
              <ul className="bg-gray-800 rounded p-2 max-h-60 overflow-y-auto">
                {searchResults.map((game) => (
                  <li
                    key={game.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => addGame(game)}
                  >
                    <span>{game.name}</span>
                    <button
                      type="button"
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      <FaPlus />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Games in Collection</h3>
            <ul className="bg-gray-800 rounded p-2">
              {games.map((game) => (
                <li
                  key={game.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer"
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

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Collection
          </button>
        </form>
      </div>
    </motion.div>
  );
}
