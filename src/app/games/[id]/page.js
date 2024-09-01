"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsonp from "jsonp";
import AddReviewModal from "../../../Components/AddReviewModal/AddReviewModal";
import { db } from "../../../../lib/firebase";
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
import { useReviews } from "../../../context/ReviewsProvider";
import Navbar from "@/Components/Navbar/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaStar, FaGamepad } from "react-icons/fa";

export default function GameDetailsPage({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { reviews: globalReviews, setReviews: setGlobalReviews } = useReviews();

  const handleAddReviewClick = async () => {
    if (!session || !session.user) {
      toast.error("You need to be logged in to add a review.");
      return;
    }

    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("gameId", "==", id),
        where("user", "==", session.user.name)
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

  const handleLikeClick = async () => {
    if (!session || !session.user) {
      toast.error("You need to be logged in to like a game.");
      return;
    }

    try {
      const userRef = doc(db, "users", session.user.email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const likedGames = userData.likedGames || [];

        if (likedGames.includes(id)) {
          // Remove from likedGames
          await updateDoc(userRef, {
            likedGames: arrayRemove(id),
          });
          setIsFavorite(false);
          toast.success("Game removed from favorites.");
        } else {
          // Add to likedGames
          await updateDoc(userRef, {
            likedGames: arrayUnion(id),
          });
          setIsFavorite(true);
          toast.success("Game added to favorites.");
        }
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("An error occurred while updating favorite status.");
    }
  };

  const handleRateGame = async (rating) => {
    if (!session || !session.user) {
      toast.error("You need to be logged in to rate a game.");
      return;
    }

    try {
      const reviewToSave = {
        rating,
        user: session.user.name,
        gameId: id,
      };
      const docRef = await addDoc(collection(db, "reviews"), reviewToSave);
      setReviews((prevReviews) => [
        ...prevReviews,
        { ...reviewToSave, id: docRef.id },
      ]);
      toast.success("Game rated successfully.");
    } catch (error) {
      console.error("Error rating game:", error);
      toast.error("An error occurred while rating the game.");
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const apiUrl = `https://www.giantbomb.com/api/game/${id}/`;
        const params = {
          api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
          format: "jsonp",
          json_callback: "jsonpCallback",
        };

        const urlParams = new URLSearchParams(params).toString();
        const apiUrlWithParams = `${apiUrl}?${urlParams}`;

        jsonp(
          apiUrlWithParams,
          { param: "json_callback" },
          async (err, data) => {
            if (err) {
              console.error("Error fetching game details:", err);
              setError(err);
              return;
            }

            if (!data || !data.results) {
              console.error("Invalid data received from API");
              setError(new Error("Invalid data received from API"));
              return;
            }

            setGame(data.results);

            try {
              // Cargar reviews desde Firestore
              const reviewsQuery = query(
                collection(db, "reviews"),
                where("gameId", "==", id)
              );
              const reviewsSnapshot = await getDocs(reviewsQuery);
              const loadedReviews = reviewsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setReviews(loadedReviews);

              // Verificar si el juego está en favoritos
              if (session?.user?.email) {
                const userRef = doc(db, "users", session.user.email);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  setIsFavorite(userData.likedGames.includes(id));
                }
              }
            } catch (firestoreError) {
              console.error("Error accessing Firestore:", firestoreError);
              setError(firestoreError);
            }
          }
        );
      } catch (error) {
        console.error("Error in fetchGameDetails:", error);
        setError(error);
      }
    };

    fetchGameDetails();
  }, [id, session]);

  useEffect(() => {
    // Filtrar las reseñas para este juego
    const gameReviews = globalReviews.filter((review) => review.gameId === id);
    setReviews(gameReviews);
  }, [id, globalReviews]);

  const handleSaveReview = async (newReview) => {
    try {
      if (newReview.rating > 0 || newReview.comment) {
        const reviewToSave = {
          ...newReview,
          user: session.user.name,
          gameId: id,
        };
        const docRef = await addDoc(collection(db, "reviews"), reviewToSave);
        setReviews((prevReviews) => [
          ...prevReviews,
          { ...reviewToSave, id: docRef.id },
        ]);
        setGlobalReviews((prevReviews) => [
          ...prevReviews,
          { ...reviewToSave, id: docRef.id },
        ]);
      }

      // Si el usuario ha dado "like", añadir el juego a la lista de juegos favoritos
      if (newReview.liked) {
        setLikedGames((prevLikedGames) => [...prevLikedGames, game]);
      }
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!game) {
    return <div className="text-center">Loading...</div>;
  }

  // Formatear la fecha de lanzamiento
  const formattedReleaseDate = game.original_release_date
    ? new Date(game.original_release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // Calcular la media de todas las reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-900 text-white"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8">
            {/* Game image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/3"
            >
              {game.image && (
                <img
                  src={game.image.medium_url}
                  alt={`${game.name} cover`}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              )}
            </motion.div>

            {/* Game details */}
            <div className="w-full lg:w-2/3">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold mb-4 text-blue-400"
              >
                {game.name}
              </motion.h1>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 bg-gray-800 p-4 rounded-lg shadow"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Game Details
                </h2>
                <p>
                  <strong className="text-blue-300">Release Date:</strong>{" "}
                  {formattedReleaseDate}
                </p>
                <p>
                  <strong className="text-blue-300">Platforms:</strong>{" "}
                  {game.platforms?.map((p) => p.name).join(", ") || "N/A"}
                </p>
                <p>
                  <strong className="text-blue-300">Genres:</strong>{" "}
                  {game.genres?.map((g) => g.name).join(", ") || "N/A"}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 bg-gray-800 p-4 rounded-lg shadow"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Description
                </h2>
                <p>{game.deck || "No description available."}</p>
              </motion.div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6 bg-gray-800 p-4 rounded-lg shadow"
              >
                <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                  Average Rating
                </h2>
                <p className="text-lg">
                  {reviews.length > 0 ? (
                    <>
                      <FaStar className="inline-block text-yellow-400 mr-2" />
                      {averageRating.toFixed(1)} / 5 ({reviews.length} reviews)
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
                className="flex items-center space-x-4 mb-6"
              >
                {session ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-600 transition"
                      onClick={handleAddReviewClick}
                    >
                      Add Review
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-lg rounded-md text-white px-6 py-3 ${
                        isFavorite
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-600 hover:bg-gray-700"
                      } transition`}
                      onClick={handleLikeClick}
                    >
                      <FaHeart className="inline-block mr-2" />
                      {isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                    </motion.button>
                  </>
                ) : (
                  <p className="text-red-400">
                    You need to log in to add a review, rate, or like a game.
                  </p>
                )}
              </motion.div>

              {/* Reviews section */}
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
                          className="p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-md"
                        >
                          <Link
                            href={`/profile/${encodeURIComponent(review.user)}`}
                            className="font-bold text-blue-400 hover:underline"
                          >
                            {review.user}
                          </Link>
                          <p className="text-yellow-400">
                            <FaStar className="inline-block mr-1" />
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </p>
                          {review.containsSpoilers && (
                            <p className="text-red-400">Contains Spoilers</p>
                          )}
                          <p className="mt-2">{review.comment}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-gray-400">No reviews yet. Be the first!</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal for adding a review */}
      {showModal && (
        <AddReviewModal
          game={game}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReview}
        />
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
