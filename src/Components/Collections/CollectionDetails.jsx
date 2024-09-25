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
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Link from "next/link";
import { FaGamepad } from "react-icons/fa";

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
    return <div>Loading...</div>;
  }

  if (!collection) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{collection.name}</h1>
        <p className="text-gray-600 mb-4">{collection.description}</p>
        <div className="flex items-center mb-4">
          {isFollowing ? (
            <FaHeart className="text-red-500 mr-2" />
          ) : (
            <FaRegHeart className="mr-2" />
          )}
          <span>{collection.followerCount || 0} followers</span>
        </div>
        {user && user.uid === collection.userId && (
          <Link
            href={`/collections/${collectionId}/edit`}
            className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit Collection
          </Link>
        )}
        <button
          onClick={handleFollow}
          className={`px-4 py-2 rounded ${
            isFollowing
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Games in this collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collection.games &&
          collection.games.map((game) => (
            <Link href={`/games/${game.id}`} key={game.id}>
              <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition duration-300">
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
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
