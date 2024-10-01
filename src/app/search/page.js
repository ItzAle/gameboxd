"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import TransparentNavbar from "../../Components/Navbar/TransparentNavbar";
import { FaSearch, FaGamepad, FaUser, FaLayerGroup } from "react-icons/fa";
import { Loader2 } from "lucide-react";

const SearchResults = () => {
  const router = useRouter();

  return (
    <Suspense fallback={<Loader2 className="animate-spin text-white" />}>
      <SearchResultsContent />
    </Suspense>
  );
};

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [results, setResults] = useState({
    games: [],
    users: [],
    collections: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("games");

  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQ(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!q) return;

      setIsLoading(true);

      try {
        // Buscar juegos
        const gamesResponse = await fetch(
          `https://api.gameboxd.me/api/games/search?q=${encodeURIComponent(q)}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        const gamesData = await gamesResponse.json();

        // Buscar usuarios
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) =>
            user.username.toLowerCase().includes(q.toLowerCase())
          );

        // Buscar colecciones
        const collectionsQuery = query(collection(db, "collections"));
        const collectionsSnapshot = await getDocs(collectionsQuery);
        const collectionsData = collectionsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((collection) =>
            collection.name.toLowerCase().includes(q.toLowerCase())
          );

        setResults({
          games: gamesData,
          users: usersData,
          collections: collectionsData,
        });
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  const tabs = [
    { id: "games", label: "Games", icon: FaGamepad },
    { id: "users", label: "Users", icon: FaUser },
    { id: "collections", label: "Collections", icon: FaLayerGroup },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white"
    >
      <TransparentNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8">Search results for: {q}</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex">
            <input
              type="text"
              name="search"
              defaultValue={q}
              placeholder="Search games, users or collections..."
              className="flex-grow p-2 bg-gray-700 rounded-l text-white"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition duration-300"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-white" />
          </div>
        ) : (
          <>
            <nav className="mb-8">
              <ul className="flex border-b border-gray-700">
                {tabs.map((tab) => (
                  <li key={tab.id} className="-mb-px mr-1">
                    <button
                      className={`inline-flex items-center py-2 px-4 text-sm font-medium leading-5 ${
                        activeTab === tab.id
                          ? "text-blue-500 border-b-2 border-blue-500 focus:outline-none focus:text-blue-800 focus:border-blue-700"
                          : "text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <tab.icon className="mr-2" />
                      {tab.label}
                      <span className="ml-2 bg-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {results[tab.id].length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "games" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.games.length > 0 ? (
                      results.games.map((game) => (
                        <Link href={`/games/${game.slug}`} key={game.id}>
                          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <img
                              src={game.coverImageUrl}
                              alt={game.name}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="text-xl font-semibold mb-2">
                                {game.name}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {game.releaseDate}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500">
                        No games found.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "users" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.users.length > 0 ? (
                      results.users.map((user) => (
                        <Link href={`/user/${user.id}`} key={user.id}>
                          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center p-4">
                            <img
                              src={user.profilePicture || "/default-avatar.png"}
                              alt={user.username}
                              className="w-16 h-16 rounded-full mr-4"
                            />
                            <div>
                              <h3 className="text-xl font-semibold">
                                {user.username}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {user.bio || "No bio available"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500">
                        No users found.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "collections" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.collections.length > 0 ? (
                      results.collections.map((collection) => (
                        <Link
                          href={`/collections/${collection.id}`}
                          key={collection.id}
                        >
                          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-4">
                              <h3 className="text-xl font-semibold mb-2">
                                {collection.name}
                              </h3>
                              <p className="text-gray-400 text-sm mb-2">
                                {collection.description}
                              </p>
                              <p className="text-blue-500 text-sm">
                                {collection.gameCount || 0} games
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500">
                        No collections found.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SearchResults;
