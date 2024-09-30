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
import { Loader2, Star, Heart, Clock, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Activity() {
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
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("userId", "in", following),
      orderBy("createdAt", "desc"),
      limit(25)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsData = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "review",
      ...doc.data(),
    }));

    const followedUsersData = await Promise.all(
      following.map(async (userId) => {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.data();
      })
    );

    const likedGamesData = followedUsersData.flatMap((userData) =>
      (userData.likedGames || []).map((game) => ({
        type: "like",
        userId: userData.id,
        username: userData.username,
        gameId: game.id,
        gameName: game.name,
        gameSlug: game.slug,
        createdAt: game.likedAt || new Date(),
      }))
    );

    return [...reviewsData, ...likedGamesData].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const fetchUserActivities = async (userId) => {
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviewsData = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "review",
      ...doc.data(),
    }));

    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();
    const likedGamesData = (userData.likedGames || []).map((game) => ({
      type: "like",
      userId: userId,
      username: userData.username,
      gameId: game.id,
      gameName: game.name,
      gameSlug: game.slug,
      createdAt: game.likedAt || new Date(),
    }));

    return [...reviewsData, ...likedGamesData].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const formatDate = (dateField) => {
    if (!dateField) return "";
    const date = dateField instanceof Date ? dateField : new Date(dateField);
    return date.toLocaleString();
  };

  const renderActivity = (activity) => {
    if (activity.type === "review") {
      return (
        <>
          <div className="flex justify-between items-start mb-2">
            <Link href={`/game/${activity.gameSlug}`} className="block">
              <h2 className="text-xl font-semibold hover:text-blue-300 transition-colors">
                {activity.gameName}
              </h2>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mb-2">
            <Link
              href={`/profile/${activity.userId}`}
              className="hover:text-blue-300 transition-colors"
            >
              {activity.username || activity.userId}
            </Link>{" "}
            wrote a review:
          </p>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < activity.rating ? "text-yellow-400" : "text-gray-600"
                }`}
                fill={i < activity.rating ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className="text-gray-300">{activity.comment}</p>
        </>
      );
    } else if (activity.type === "like") {
      return (
        <>
          <div className="flex items-center mb-2">
            <Heart className="h-5 w-5 text-red-500 fill-current mr-2" />
            <p className="text-sm text-gray-400">
              <Link
                href={`/profile/${activity.userId}`}
                className="hover:text-blue-300 transition-colors"
              >
                {activity.username || activity.userId}
              </Link>{" "}
              liked
              <Link
                href={`/game/${activity.gameSlug}`}
                className="ml-1 font-semibold hover:text-blue-300 transition-colors"
              >
                {activity.gameName}
              </Link>
            </p>
          </div>
        </>
      );
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-blue-900">
        <Loader2 className="animate-spin text-white" />
      </div>
    );

  if (error || reviewsError)
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-red-500 text-xl bg-gray-800 p-6 rounded-lg shadow-lg">
          Error: {error || reviewsError}
        </div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white"
    >
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8 mt-24">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-center text-blue-300"
        >
          Activity
        </motion.h1>

        <nav className="mb-8 overflow-x-auto">
          <ul className="flex border-b border-gray-700 whitespace-nowrap">
            <li className="mr-2 flex-shrink-0">
              <button
                className={`py-2 px-4 ${
                  activeTab === "following" ? "border-b-2 border-blue-500" : ""
                }`}
                onClick={() => setActiveTab("following")}
              >
                Following Activity
              </button>
            </li>
            <li className="mr-2 flex-shrink-0">
              <button
                className={`py-2 px-4 ${
                  activeTab === "your-activity"
                    ? "border-b-2 border-blue-500"
                    : ""
                }`}
                onClick={() => setActiveTab("your-activity")}
              >
                Your Activity
              </button>
            </li>
          </ul>
        </nav>

        <main>
          <AnimatePresence mode="wait">
            {activeTab === "following" && (
              <motion.div
                key="following"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Following Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {followedUsersActivities.length > 0 ? (
                    followedUsersActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="p-6">
                          {renderActivity(activity)}
                          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center text-xl text-gray-400"
                    >
                      No recent activity from followed users.
                      <div className="mt-4">
                        <Link
                          href="/discover"
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          <UserPlus className="mr-2" />
                          Discover Users to Follow
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
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
                <h2 className="text-2xl font-semibold mb-4">Your Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userActivities.length > 0 ? (
                    userActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                      >
                        <div className="p-6">
                          {renderActivity(activity)}
                          <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full text-center text-xl text-gray-400"
                    >
                      You haven&apos;t had any activity yet.
                      <div className="mt-4">
                        <Link
                          href="/games"
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Explore Games
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
