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
  setDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useReviews } from "../../../context/ReviewsProvider";
import Navbar from "@/Components/Navbar/Navbar";
import { motion } from "framer-motion";
import { FaHeart, FaStar } from "react-icons/fa";

export default function GameDetailsPage({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [likedGames, setLikedGames] = useState([]);
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
      const docRef = doc(db, "favorites", `${session.user.id}_${id}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentLikeStatus = docSnap.data().liked;
        await setDoc(docRef, { liked: !currentLikeStatus }, { merge: true });
        setIsFavorite(!currentLikeStatus);
        toast.success(
          !currentLikeStatus
            ? "Game added to favorites."
            : "Game removed from favorites."
        );
      } else {
        await setDoc(docRef, { liked: true });
        setIsFavorite(true);
        toast.success("Game added to favorites.");
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
              if (session?.user?.id) {
                const docRef = doc(db, "favorites", `${session.user.id}_${id}`);
                const docSnap = await getDoc(docRef);

                setIsFavorite(docSnap.exists() ? docSnap.data().liked : false);
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
      <div className="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-8">
        {/* Imagen del juego a la izquierda */}
        <div className="w-full lg:w-1/3">
          {game.image && (
            <motion.img
              src={game.image.medium_url}
              alt={`${game.name} cover`}
              className="w-full h-auto object-cover rounded mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
          <div className="mt-4">
            <motion.h2
              className="text-2xl font-semibold mb-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Description
            </motion.h2>
            <motion.p
              className="text-lg"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {game.deck || "No description available."}
            </motion.p>
          </div>
        </div>

        {/* Detalles del juego a la derecha */}
        <div className="w-full lg:w-2/3">
          <motion.h1
            className="text-4xl font-bold mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {game.name}
          </motion.h1>

          <div className="mb-4">
            <motion.h2
              className="text-2xl font-semibold mb-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Game Details
            </motion.h2>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <strong>Release Date:</strong> {formattedReleaseDate}
            </motion.p>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <strong>Platforms:</strong>{" "}
              {game.platforms?.map((p) => p.name).join(", ") || "N/A"}
            </motion.p>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <strong>Genres:</strong>{" "}
              {game.genres?.map((g) => g.name).join(", ") || "N/A"}
            </motion.p>
          </div>

          {/* Mostrar la media de las reviews */}
          <div className="mb-4">
            <motion.h2
              className="text-2xl font-semibold mb-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Average Rating
            </motion.h2>
            <motion.p
              className="text-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {reviews.length > 0
                ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reviews)`
                : "No reviews yet."}
            </motion.p>
          </div>

          <motion.div
            className="flex items-center space-x-4 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {session ? (
              <>
                <motion.button
                  className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-600 transition mb-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddReviewClick}
                >
                  Add Review
                </motion.button>
                <motion.button
                  className={`text-lg rounded-md text-white px-6 py-3 mb-4 ${
                    isFavorite ? "bg-red-500" : "bg-gray-400"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLikeClick}
                >
                  <FaHeart className="inline-block mr-2" />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </motion.button>
              </>
            ) : (
              <p className="text-red-500 mb-4">
                You need to log in to add a review, rate, or like a game.
              </p>
            )}
          </motion.div>

          {/* Lista de reviews */}
          <div>
            <motion.h2
              className="text-2xl font-semibold mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Reviews
            </motion.h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    className="p-4 border border-gray-300 rounded bg-white shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link
                      href={`/profile/${encodeURIComponent(review.user)}`}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {review.user}
                    </Link>
                    <p className="text-yellow-500">
                      <FaStar className="inline-block" />
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                    {review.containsSpoilers && (
                      <p className="text-red-500">Contains Spoilers</p>
                    )}
                    <p>{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>

        {/* Modal para añadir una review */}
        {showModal && (
          <AddReviewModal
            game={game}
            onClose={() => setShowModal(false)}
            onSave={handleSaveReview}
          />
        )}
      </div>
    </>
  );
}
