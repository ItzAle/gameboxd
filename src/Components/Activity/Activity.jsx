"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { useReviews } from "../../context/ReviewsProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Star, Heart, Clock, Edit, User } from "lucide-react";
import Link from "next/link";

export default function Component() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedUsersActivities, setFollowedUsersActivities] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const { user } = useAuth();
  const { reviews: globalReviews, error: reviewsError } = useReviews();
  const [activeTab, setActiveTab] = useState("following");

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const following = userData.following || [];

        const followedActivities = await fetchFollowedUsersActivities(
          following
        );

        setFollowedUsersActivities(followedActivities);

        const userActivities = await fetchUserActivities(user.uid);

        setUserActivities(userActivities);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading activities:", error);
        setError("Error loading activities");
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const fetchFollowedUsersActivities = async (following) => {
    const activities = [];

    // Obtener reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("userId", "in", following),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);

    for (const document of reviewsSnapshot.docs) {
      const reviewData = document.data();
      const userDocRef = doc(db, "users", reviewData.userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      activities.push({
        id: document.id,
        type: "review",
        ...reviewData,
        username: userData?.username,
        userProfileImage: userData?.profilePicture || null, // Cambiado a profilePicture
      });
    }

    // Obtener likes
    for (const userId of following) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      if (userData && userData.likedGames) {
        userData.likedGames.forEach((game) => {
          activities.push({
            id: `${userId}-${game.id}`,
            type: "like",
            userId: userId,
            username: userData.username,
            gameId: game.id,
            gameName: game.name,
            gameSlug: game.slug,
            createdAt: game.likedAt || new Date(),
            userProfileImage: userData.profilePicture || null, // Cambiado a profilePicture
          });
        });
      }
    }

    return activities.sort(
      (a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt)
    );
  };

  const fetchUserActivities = async (userId) => {
    const activities = [];

    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();

    // Obtener reviews del usuario
    const userReviewsQuery = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const reviewsSnapshot = await getDocs(userReviewsQuery);

    reviewsSnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        type: "review",
        ...doc.data(),
        username: userData?.username,
        userProfileImage: userData?.profilePicture || null, // Cambiado a profilePicture
      });
    });

    // Obtener likes del usuario
    if (userData && userData.likedGames) {
      userData.likedGames.forEach((game) => {
        activities.push({
          id: `${userId}-${game.id}`,
          type: "like",
          userId: userId,
          username: userData.username,
          gameId: game.id,
          gameName: game.name,
          gameSlug: game.slug,
          createdAt: game.likedAt || new Date(),
          userProfileImage: userData.profilePicture || null, // Cambiado a profilePicture
        });
      });
    }

    return activities.sort(
      (a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt)
    );
  };

  const getDateValue = (date) => {
    if (date && typeof date.toDate === "function") {
      return date.toDate().getTime();
    }
    return new Date(date).getTime();
  };

  const formatDate = (date) => {
    if (date && typeof date.toDate === "function") {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const renderActivity = (activity) => {
    if (!activity || typeof activity !== "object") {
      console.error("Invalid activity:", activity);
      return null;
    }

    const {
      type,
      userId,
      username,
      gameId,
      gameSlug,
      gameName,
      rating,
      comment,
      userProfileImage,
    } = activity;

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4 mb-4">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt={`${username}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-gray-400" size={20} />
            )}
          </div>
          <div>
            <Link
              href={`/user/${userId}`}
              className="font-semibold text-lg hover:underline text-blue-400"
            >
              {username}
            </Link>
            <div className="text-sm text-gray-400">
              {type === "review" ? "reviewed" : "liked"}
              <Link
                href={`/game/${type === "review" ? gameId : gameSlug}`}
                className="font-semibold ml-1 hover:underline text-blue-400"
              >
                {gameName}
              </Link>
            </div>
          </div>
        </div>

        {type === "review" ? (
          <div className="ml-13">
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < (rating || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  }
                  size={16}
                />
              ))}
            </div>
            {comment && <p className="text-sm text-gray-300 mb-2">{comment}</p>}
          </div>
        ) : (
          <div className="ml-13 inline-block px-2 py-1 rounded-full text-xs bg-red-900 text-red-200">
            <Heart className="inline-block mr-1 h-3 w-3" /> Liked
          </div>
        )}

        <div className="text-xs text-gray-500 flex items-center mt-2">
          <Clock className="h-3 w-3 mr-1" />
          {activity.createdAt ? formatDate(activity.createdAt) : "Unknown date"}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (error || reviewsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="bg-red-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error || reviewsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8 mt-24">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          Activity
        </h1>

        <div className="mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`py-2 px-4 ${
                activeTab === "following"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("following")}
            >
              Following Activity
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "your-activity"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("your-activity")}
            >
              Your Activity
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "following" && (
            <motion.div
              key="following"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Following Activity
              </h2>
              {followedUsersActivities.length > 0 ? (
                <div className="space-y-4">
                  {followedUsersActivities.map((activity, index) => (
                    <motion.div key={activity.id || index} layout>
                      {renderActivity(activity)}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  No recent activity from followed users.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === "your-activity" && (
            <motion.div
              key="your-activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Your Activity
              </h2>
              {userActivities.length > 0 ? (
                <div className="space-y-4">
                  {userActivities.map((activity, index) => (
                    <motion.div key={activity.id || index} layout>
                      {renderActivity(activity)}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  You haven&apos;t had any activity yet.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
