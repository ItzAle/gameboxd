"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import Link from "next/link";
import {
  FaHeart,
  FaRegHeart,
  FaGamepad,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export default function CollectionDetails({ collectionId }) {
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;

      try {
        const docRef = doc(db, "collections", collectionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const collectionData = { id: docSnap.id, ...docSnap.data() };
          setCollection(collectionData);
          if (user) {
            setIsFollowing(
              collectionData.followers?.includes(user.uid) || false
            );
          }
        } else {
          console.log("No such collection!");
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [collectionId, user]);

  const handleFollow = async () => {
    if (!user || !collection) return;

    const collectionRef = doc(db, "collections", collectionId);
    try {
      if (isFollowing) {
        await updateDoc(collectionRef, {
          followers: arrayRemove(user.uid),
          followerCount: increment(-1),
        });
      } else {
        await updateDoc(collectionRef, {
          followers: arrayUnion(user.uid),
          followerCount: increment(1),
        });
      }

      // Update local state
      setIsFollowing(!isFollowing);
      setCollection((prev) => ({
        ...prev,
        followerCount: isFollowing
          ? prev.followerCount - 1
          : prev.followerCount + 1,
      }));
    } catch (error) {
      console.error("Error updating followers:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
        <h1 className="text-3xl font-bold text-white">Collection not found</h1>
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
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">{collection.name}</h1>
          <p className="text-gray-300 mb-4">{collection.description}</p>
          <div className="flex items-center mb-4">
            {isFollowing ? (
              <FaHeart className="text-red-500 mr-2" />
            ) : (
              <FaRegHeart className="mr-2" />
            )}
            <span>{collection.followerCount || 0} followers</span>
          </div>
          <div className="flex space-x-4">
            {user && user.uid === collection.userId && (
              <Link
                href={`/collections/${collectionId}/edit`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center"
              >
                <FaEdit className="mr-2" /> Edit Collection
              </Link>
            )}
            <button
              onClick={handleFollow}
              className={`px-4 py-2 rounded ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white flex items-center`}
            >
              {isFollowing ? (
                <FaHeart className="mr-2" />
              ) : (
                <FaRegHeart className="mr-2" />
              )}
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Games in this collection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.games &&
            collection.games.map((game) => (
              <Link href={`/games/${game.slug}`} key={game.slug}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition duration-300"
                >
                  <div className="flex items-center mb-2">
                    <FaGamepad className="text-2xl mr-3 text-blue-500" />
                    <h3 className="font-semibold">{game.name}</h3>
                  </div>
                  {game.coverImageUrl && (
                    <img
                      src={game.coverImageUrl}
                      alt={`${game.name} cover`}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-sm text-gray-400">
                    {game.description?.substring(0, 100)}...
                  </p>
                </motion.div>
              </Link>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
