"use client";
import { useState, useEffect, useCallback } from "react";
import { FaList, FaPlus, FaUser, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
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

export default function CollectionsPage() {
  const { user } = useAuth();
  const [ownCollections, setOwnCollections] = useState([]);
  const [followedCollections, setFollowedCollections] = useState([]);
  const [recentCollections, setRecentCollections] = useState([]);
  const [popularCollections, setPopularCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allCollections, setAllCollections] = useState([]);

  useEffect(() => {
    const fetchAllCollections = async () => {
      const collectionsQuery = query(collection(db, "collections"));
      const querySnapshot = await getDocs(collectionsQuery);
      const collectionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
    const unsubscribePopular = onSnapshot(popularCollectionsQuery, (snapshot) => {
      const collectionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPopularCollections(collectionsData);
    });

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
      const unsubscribeFollowed = onSnapshot(followedCollectionsQuery, (snapshot) => {
        const collectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFollowedCollections(collectionsData);
      });

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
    const filteredCollections = allCollections.filter(collection => 
      (collection.name && collection.name.toLowerCase().includes(lowercasedTerm)) ||
      (collection.description && collection.description.toLowerCase().includes(lowercasedTerm)) ||
      (Array.isArray(collection.hashtags) && collection.hashtags.some(tag => tag.toLowerCase().includes(lowercasedTerm))) ||
      (Array.isArray(collection.games) && collection.games.some(game => game.name && game.name.toLowerCase().includes(lowercasedTerm)))
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

  const CollectionCard = ({ collection, showActions = false }) => (
    <div key={collection.id} className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <FaList className="text-2xl mr-3 text-blue-500" />
        <div className="flex-grow">
          <h3 className="font-semibold">{collection.name}</h3>
          <p className="text-sm text-gray-400">{collection.gameCount} games</p>
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-2">{collection.description}</p>
      <div className="flex items-center text-sm text-gray-400 mb-2">
        <FaUser className="mr-1" />
        <span>{collection.creatorName}</span>
      </div>
      <div className="mb-2">
        {collection.hashtags && collection.hashtags.map((tag) => (
          <span key={tag} className="inline-block bg-blue-500 text-white rounded-full px-2 py-1 text-xs mr-2 mb-2">
            #{tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <Link href={`/collections/${collection.id}`} className="text-blue-400 hover:text-blue-500">
          View Collection
        </Link>
        {showActions && (
          <div className="flex space-x-2">
            <Link href={`/collections/${collection.id}/edit`} className="text-yellow-400 hover:text-yellow-500">
              <FaEdit />
            </Link>
            <button
              onClick={() => handleDelete(collection.id)}
              className="text-red-400 hover:text-red-500"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
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

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search collections..."
            className="flex-grow p-2 bg-gray-700 rounded-l"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r">
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

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Recent Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Popular Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      {user && (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Your Creations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} showActions={true} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Followed Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
