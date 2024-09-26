"use client";
import { useState, useEffect, useCallback } from "react";
import {
  FaList,
  FaPlus,
  FaUser,
  FaEdit,
  FaTrash,
  FaSearch,
} from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { motion } from "framer-motion";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import { Tab } from "@headlessui/react";

export default function CollectionsPage() {
  const { user } = useAuth();
  const [ownCollections, setOwnCollections] = useState([]);
  const [followedCollections, setFollowedCollections] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [popularCollections, setPopularCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("recent-collections");

  useEffect(() => {
    const fetchAllCollections = async () => {
      const collectionsQuery = query(collection(db, "collections"));
      const querySnapshot = await getDocs(collectionsQuery);
      const collectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCollections(collectionsData);
    };

    fetchAllCollections();

    // Cargar colecciones recientes
    const recentCollectionsQuery = query(
      collection(db, "collections"),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    const unsubscribeRecent = onSnapshot(recentCollectionsQuery, (snapshot) => {
      const collectionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentCollections(collectionsData);
    });

    // Cargar colecciones populares
    const popularCollectionsQuery = query(
      collection(db, "collections"),
      orderBy("followerCount", "desc"),
      limit(6)
    );
    const unsubscribePopular = onSnapshot(
      popularCollectionsQuery,
      (snapshot) => {
        const collectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPopularCollections(collectionsData);
      }
    );

    if (user) {
      // Cargar colecciones propias
      const ownCollectionsQuery = query(
        collection(db, "collections"),
        where("userId", "==", user.uid)
      );
      const unsubscribeOwn = onSnapshot(ownCollectionsQuery, (snapshot) => {
        const collectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOwnCollections(collectionsData);
      });

      // Cargar colecciones seguidas
      const followedCollectionsQuery = query(
        collection(db, "collections"),
        where("followers", "array-contains", user.uid)
      );
      const unsubscribeFollowed = onSnapshot(
        followedCollectionsQuery,
        (snapshot) => {
          const collectionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFollowedCollections(collectionsData);
        }
      );

      return () => {
        unsubscribeOwn();
        unsubscribeFollowed();
      };
    }

    return () => {
      unsubscribeRecent();
      unsubscribePopular();
    };
  }, [user]);

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filteredCollections = allCollections.filter(
      (collection) =>
        (collection.name &&
          collection.name.toLowerCase().includes(lowercasedTerm)) ||
        (collection.description &&
          collection.description.toLowerCase().includes(lowercasedTerm)) ||
        (Array.isArray(collection.hashtags) &&
          collection.hashtags.some((tag) =>
            tag.toLowerCase().includes(lowercasedTerm)
          )) ||
        (Array.isArray(collection.games) &&
          collection.games.some(
            (game) =>
              game.name && game.name.toLowerCase().includes(lowercasedTerm)
          ))
    );

    setSearchResults(filteredCollections);
  }, [searchTerm, allCollections]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleDelete = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await deleteDoc(doc(db, "collections", collectionId));
      } catch (error) {
        console.error("Error deleting collection:", error);
      }
    }
  };

  const CollectionCard = ({ collection, showActions = false }) => {
    const firstGame = collection.games?.[0] || {};

    return (
      <Link href={`/collections/${collection.id}`}>
        <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
          {/* Imagen de fondo */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundImage: `url(${firstGame.coverImageUrl})` }}
          />

          {/* Gradiente de difuminado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Contenido de la tarjeta */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h3 className="font-semibold text-xl text-white mb-2">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
              {collection.description}
            </p>

            <div className="flex items-center text-sm text-gray-400 mb-2">
              <FaUser className="mr-1" />
              <span>{collection.creatorName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-400">
                {collection.gameCount} games
              </span>
              <div className="flex space-x-2">
                {showActions && (
                  <>
                    <Link
                      href={`/collections/${collection.id}/edit`}
                      className="text-yellow-400 hover:text-yellow-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(collection.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Game Collections</h1>
          {user && (
            <Link
              href="/collections/create"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Create Collection
            </Link>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mb-8"
        >
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search collections..."
              className="flex-grow p-2 bg-gray-700 rounded-l"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        )}

        <nav className="mb-8 overflow-x-auto">
          <ul className="flex border-b border-gray-700 whitespace-nowrap">
            {[
              "Recent Collections",
              "Popular Collections",
              user && "Your Creations",
              user && "Followed Collections",
            ]
              .filter(Boolean)
              .map((tab) => (
                <li key={tab} className="mr-2 flex-shrink-0">
                  <button
                    className={`py-2 px-4 ${
                      activeTab === tab.toLowerCase().replace(" ", "-")
                        ? "border-b-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveTab(tab.toLowerCase().replace(" ", "-"))
                    }
                  >
                    {tab}
                  </button>
                </li>
              ))}
          </ul>
        </nav>

        <main>
          {activeTab === "recent-collections" && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Recent Collections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </section>
          )}
          {activeTab === "popular-collections" && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Popular Collections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </section>
          )}
          {user && activeTab === "your-creations" && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Your Creations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownCollections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    showActions={true}
                  />
                ))}
              </div>
            </section>
          )}
          {user && activeTab === "followed-collections" && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Followed Collections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </motion.div>
  );
}
