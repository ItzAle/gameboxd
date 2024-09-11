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

export default function Journal() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedUsersReviews, setFollowedUsersReviews] = useState([]);
  const { user } = useAuth();
  const { reviews: globalReviews, error: reviewsError } = useReviews();

  useEffect(() => {
    const fetchFollowedUsersReviews = async () => {
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
          limit(50)
        );

        const querySnapshot = await getDocs(reviewsQuery);
        const reviewsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFollowedUsersReviews(reviewsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setError("Error loading reviews");
        setIsLoading(false);
      }
    };

    fetchFollowedUsersReviews();
  }, [user]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-blue-900">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-blue-300"
        >
          Journal
        </motion.h1>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {followedUsersReviews.length > 0 ? (
              followedUsersReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/games/${review.gameId}`} className="block">
                        <h2 className="text-xl font-semibold hover:text-blue-300 transition-colors">
                          {review.gameName}
                        </h2>
                      </Link>
                      {review.isLiked && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      By:{" "}
                      <Link
                        href={`/profile/${review.userId}`}
                        className="hover:text-blue-300 transition-colors"
                      >
                        {review.username || review.userId}
                      </Link>
                    </p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-600"
                          }`}
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-300">{review.comment}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {review.createdAt &&
                          (typeof review.createdAt === "object" &&
                          review.createdAt.toDate
                            ? new Date(
                                review.createdAt.toDate()
                              ).toLocaleString()
                            : new Date(review.createdAt).toLocaleString())}
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
                No recent reviews from followed users. (Total reviews:{" "}
                {followedUsersReviews.length})
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
