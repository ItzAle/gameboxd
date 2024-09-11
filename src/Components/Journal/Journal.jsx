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
import { Loader2, Star } from "lucide-react";
import Link from "next/link";

export default function Journal() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { reviews: globalReviews, error: reviewsError } = useReviews();

  useEffect(() => {
    const fetchReviews = async () => {
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

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setError("Error loading reviews");
        setIsLoading(false);
      }
    };

    fetchReviews();
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

  const filteredReviews = globalReviews.filter(
    (review) =>
      user &&
      (review.userId === user.uid ||
        (user.following && user.following.includes(review.userId)))
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
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <Link
                      href={`/games/${review.gameId}`}
                      className="block mb-2"
                    >
                      <h2 className="text-xl font-semibold hover:text-blue-300 transition-colors">
                        {review.gameName}
                      </h2>
                    </Link>
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
                    <p className="text-sm text-gray-400 mt-4">
                      {review.createdAt &&
                        new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-xl text-gray-400"
              >
                No recent reviews. (Total reviews: {filteredReviews.length})
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
