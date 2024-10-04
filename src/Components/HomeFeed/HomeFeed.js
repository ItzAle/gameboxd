import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
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
import { Loader2, Star, Heart, Clock } from "lucide-react";

const HomeFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User information not found");
          setIsLoading(false);
          return;
        }

        const userData = userSnap.data();
        const following = userData.following || [];

        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "in", following),
          orderBy("createdAt", "desc"),
          limit(10)
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
            createdAt: game.likedAt || new Date(),
          }))
        );

        const allActivities = [...reviewsData, ...likedGamesData]
          .sort((a, b) => {
            const dateA =
              a.createdAt && a.createdAt.toDate
                ? a.createdAt.toDate()
                : new Date(a.createdAt);
            const dateB =
              b.createdAt && b.createdAt.toDate
                ? b.createdAt.toDate()
                : new Date(b.createdAt);
            return dateB - dateA;
          })
          .slice(0, 6);

        setActivities(allActivities);
        setIsLoading(false);
      } catch (error) {
        setError("Error loading activities");
        setIsLoading(false);
      }
    };

    fetchActivities();
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

  const renderActivity = (activity) => {
    if (activity.type === "review") {
      return (
        <>
          <div className="flex justify-between items-start mb-2">
            <Link href={`/games/${activity.gameId}`}>
              <span className="text-lg font-semibold hover:text-blue-300 transition-colors">
                {activity.gameName}
              </span>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mb-2">
            <Link href={`/profile/${activity.userId}`}>
              <span className="hover:text-blue-300 transition-colors">
                {activity.username || activity.userId}
              </span>
            </Link>{" "}
            wrote a review:
          </p>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < activity.rating ? "text-yellow-400" : "text-gray-600"
                }`}
                fill={i < activity.rating ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className="text-gray-300 text-sm">{activity.comment}</p>
        </>
      );
    } else if (activity.type === "like") {
      return (
        <>
          <div className="flex items-center mb-2">
            <Heart className="h-4 w-4 text-red-500 fill-current mr-2" />
            <p className="text-sm text-gray-400">
              <Link href={`/profile/${activity.userId}`}>
                <span className="hover:text-blue-300 transition-colors">
                  {activity.username || activity.userId}
                </span>
              </Link>{" "}
              liked{" "}
              <Link href={`/games/${activity.gameId}`}>
                <span className="font-semibold hover:text-blue-300 transition-colors">
                  {activity.gameName}
                </span>
              </Link>
            </p>
          </div>
        </>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center h-screen flex justify-center items-center  bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-800 p-4 rounded-lg"
            >
              {renderActivity(activity)}
              <div className="flex items-center justify-end mt-2 text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(activity.createdAt)}
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-400"
          >
            There is no recent activity here, follow more users to see their
            activity!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeFeed;
