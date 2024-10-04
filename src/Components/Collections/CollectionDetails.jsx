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
import { Loader2 } from "lucide-react";

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
        }
      } catch (error) {
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
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex justify-center items-center">
        <Loader2 className="animate-spin text-white" />
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
                <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                  {/* Imagen de fondo */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: `url(${game.coverImageUrl})` }}
                  />

                  {/* Gradiente de difuminado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

                  {/* Contenido de la tarjeta */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="font-semibold text-xl text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {game.description?.substring(0, 100)}...
                    </p>

                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <FaGamepad className="mr-1" />
                      <span>{game.platforms?.join(", ") || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
