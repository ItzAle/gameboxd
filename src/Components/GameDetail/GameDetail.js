"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import jsonp from "jsonp";
import AddReviewModal from "../../Components/AddReviewModal/AddReviewModal";
import { db } from "../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useReviews } from "../../context/ReviewsProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaStar,
  FaGamepad,
  FaCalendarAlt,
  FaDesktop,
  FaTags,
} from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export default function GameDetailsPage({ id }) {
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { reviews: globalReviews, setReviews: setGlobalReviews } = useReviews();

  const handleAddReviewClick = async () => {
    if (!user) {
      toast.error("You need to be logged in to add a review.");
      return;
    }

    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("gameId", "==", id),
        where("userId", "==", user.uid)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);

      if (!reviewsSnapshot.empty) {
        toast.error("You have already submitted a review for this game.");
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error checking existing reviews:", error);
      toast.error("An error occurred while checking for existing reviews.");
    }
  };

  const handleSaveReview = async (newReview) => {
    // No necesitamos crear un nuevo objeto de reseña aquí,
    // ya que lo recibimos completo desde AddReviewModal
    setReviews((prevReviews) => {
      // Verificar si la reseña ya existe en el array
      const reviewExists = prevReviews.some(review => review.id === newReview.id);
      if (reviewExists) {
        return prevReviews; // No añadir si ya existe
      }
      return [...prevReviews, newReview]; // Añadir solo si es nueva
    });

    setShowModal(false);
  };

  const handleLikeClick = async () => {
    if (!user) {
      toast.error("Necesitas iniciar sesión para marcar un juego como favorito.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const likedGames = userData.likedGames || [];

        const gameToSave = {
          slug: game.slug,
          name: game.name,
          coverImageUrl: game.coverImageUrl
        };

        const gameIndex = likedGames.findIndex(g => g.slug === game.slug);

        if (gameIndex !== -1) {
          // El juego ya está en favoritos, lo eliminamos
          await updateDoc(userRef, {
            likedGames: arrayRemove(likedGames[gameIndex])
          });
          setIsFavorite(false);
          toast.success("Juego eliminado de favoritos.");
        } else {
          // El juego no está en favoritos, lo añadimos
          await updateDoc(userRef, {
            likedGames: arrayUnion(gameToSave)
          });
          setIsFavorite(true);
          toast.success("Juego añadido a favoritos.");
        }
      }
    } catch (error) {
      console.error("Error al actualizar el estado de favorito:", error);
      toast.error("Ocurrió un error al actualizar el estado de favorito.");
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`https://gbxd-api.vercel.app/api/game/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setGame(data);

        try {
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("gameId", "==", id)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const loadedReviews = reviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            userId: doc.data().userId,
          }));
          setReviews(loadedReviews);

          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setIsFavorite(userData.likedGames?.some(g => g.slug === id) || false);
            }
          }
        } catch (firestoreError) {
          console.error("Error accessing Firestore:", firestoreError);
          setError(firestoreError);
        }
      } catch (error) {
        console.error("Error in fetchGameDetails:", error);
        setError(error);
      }
    };

    fetchGameDetails();
  }, [id, user]);

  useEffect(() => {
    const gameReviews = globalReviews.filter((review) => review.gameId === id);
    setReviews(gameReviews);
  }, [id, globalReviews]);

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!game) {
    return <div className="text-center">Loading...</div>;
  }

  const formattedReleaseDate = game.releaseDate
    ? new Date(game.releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white pt-20"
      >
        <TransparentNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/3"
            >
              {game.coverImageUrl && (
                <img
                  src={game.coverImageUrl}
                  alt={`${game.name} cover`}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              )}
            </motion.div>

            <div className="w-full lg:w-2/3">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-4 text-blue-300"
              >
                {game.name}
              </motion.h1>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-md backdrop-blur-sm"
              >
                <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                  Game Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-400 mr-2" />
                    <p>
                      <strong className="text-blue-300">Release Date:</strong>{" "}
                      {formattedReleaseDate}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <FaDesktop className="text-blue-400 mr-2" />
                    <p>
                      <strong className="text-blue-300">Platforms:</strong>{" "}
                      {game.platforms?.join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <FaTags className="text-blue-400 mr-2" />
                    <p>
                      <strong className="text-blue-300">Genres:</strong>{" "}
                      {game.genres?.join(", ") || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-md backdrop-blur-sm"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Description
                </h2>
                <p className="text-gray-300">
                  {game.description || "No description available."}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 bg-gray-800 bg-opacity-50 p-6 rounded-lg shadow-md backdrop-blur-sm"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Average Rating
                </h2>
                <p className="text-lg flex items-center">
                  {reviews.length > 0 ? (
                    <>
                      <FaStar className="text-yellow-400 mr-2" />
                      <span className="font-bold text-yellow-400">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-300 ml-2">
                        / 5 ({reviews.length} reviews)
                      </span>
                    </>
                  ) : (
                    "No reviews yet."
                  )}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 mb-6"
              >
                {user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md"
                      onClick={handleAddReviewClick}
                    >
                      Add Review
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-lg rounded-md text-white px-6 py-3 transition duration-300 ease-in-out shadow-md ${
                        isFavorite
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      onClick={handleLikeClick}
                    >
                      <FaHeart className="inline-block mr-2" />
                      {isFavorite ? "" : ""}
                    </motion.button>
                  </>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 bg-gray-800 bg-opacity-50 p-4 rounded-md shadow-md"
                  >
                    You need to log in to add a review, rate, or like a game.
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                  Reviews
                </h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {reviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-6 border border-gray-700 rounded-lg bg-gray-800 bg-opacity-50 shadow-md backdrop-blur-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <Link
                              href={`/profile/${encodeURIComponent(
                                review.userId
                              )}`}
                              className="font-bold text-blue-400 hover:underline"
                            >
                              {review.username}
                            </Link>
                            <p className="text-yellow-400 flex items-center">
                              <FaStar className="mr-1" />
                              {review.rating}
                            </p>
                          </div>
                          {review.containsSpoilers && (
                            <p className="text-red-400 mb-2">
                              Contains Spoilers
                            </p>
                          )}
                          <p className="text-gray-300">{review.comment}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-gray-400 bg-gray-800 bg-opacity-50 p-4 rounded-md shadow-md">
                    No reviews yet. Be the first!
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <AddReviewModal
          game={{
            slug: game.slug,
            name: game.name,
            coverImageUrl: game.coverImageUrl
          }}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReview}
        />
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
