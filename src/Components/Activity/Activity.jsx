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
import { Loader2, Star, Heart, Clock } from "lucide-react";
import Link from "next/link";

export default function Activity() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedUsersActivities, setFollowedUsersActivities] = useState([]);
  const { user } = useAuth();
  const { reviews: globalReviews, error: reviewsError } = useReviews();

  useEffect(() => {
    const fetchFollowedUsersActivities = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching user data...");
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User information not found");
          setIsLoading(false);
          return;
        }

        const userData = userSnap.data();
        const following = userData.following || [];
        console.log("Following users:", following);

        console.log("Fetching reviews...");
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "in", following),
          orderBy("createdAt", "desc"),
          limit(25)
        );

        const reviewsSnapshot = await getDocs(reviewsQuery);
        console.log("Reviews fetched:", reviewsSnapshot.size);

        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "review",
          ...doc.data(),
        }));

        console.log("Fetching liked games from user profiles...");
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
            createdAt: game.likedAt || new Date(), // Asume que hay un campo 'likedAt', si no, usa la fecha actual
          }))
        );

        console.log("Liked games data:", likedGamesData);

        const allActivities = [...reviewsData, ...likedGamesData].sort(
          (a, b) => {
            const dateA =
              a.createdAt && a.createdAt.toDate
                ? a.createdAt.toDate()
                : new Date(a.createdAt);
            const dateB =
              b.createdAt && b.createdAt.toDate
                ? b.createdAt.toDate()
                : new Date(b.createdAt);
            return dateB - dateA;
          }
        );

        console.log("All activities:", allActivities);

        setFollowedUsersActivities(allActivities);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading activities:", error);
        setError("Error loading activities");
        setIsLoading(false);
      }
    };

    fetchFollowedUsersActivities();
  }, [user]);

  const formatDate = (dateField) => {
    if (!dateField) return "";
    if (typeof dateField === "object" && dateField.toDate instanceof Function) {
      return dateField.toDate().toLocaleString();
    }
    if (dateField instanceof Date) {
      return dateField.toLocaleString();
    }
    if (typeof dateField === "number") {
      return new Date(dateField).toLocaleString();
    }
    if (typeof dateField === "string") {
      return new Date(dateField).toLocaleString();
    }
    return "Invalid Date";
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

  const renderActivity = (activity) => {
    console.log("Rendering activity:", activity);
    if (activity.type === "review") {
      return (
        <>
          <div className="flex justify-between items-start mb-2">
            <Link href={`/games/${activity.gameId}`} className="block">
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
                href={`/games/${activity.gameId}`}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-blue-300"
        >
          Activity
        </motion.h1>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                No recent activity from followed users. (Total activities:{" "}
                {followedUsersActivities.length})
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
