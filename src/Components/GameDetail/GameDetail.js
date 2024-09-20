"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { useReviews } from "../../context/ReviewsProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaDesktop,
  FaTags,
  FaRegHeart,
  FaSteam,
  FaPlaystation,
  FaXbox,
  FaGamepad,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import GoogleAdSense from "../Ads/GoogleAdSense";
import { Loader } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import { getUsernameStyle } from "../../utils/usernameStyles";
import Image from "next/image";
import AddReviewModal from "../AddReviewModal/AddReviewModal";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";

export default function GameDetailsPage({ id }) {
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { reviews: globalReviews, setReviews: setGlobalReviews } = useReviews();
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteGamesCount, setFavoriteGamesCount] = useState(0);
  const [userPreferences, setUserPreferences] = useState(null);

  const handleAddReviewClick = () => {
    if (!user) {
      toast.error("Necesitas iniciar sesión para añadir una reseña.");
      return;
    }

    const userHasReviewed = reviews.some(
      (review) => review.userId === user.uid
    );

    if (userHasReviewed) {
      toast.error("You have already submitted a review for this game.");
    } else {
      setShowModal(true);
    }
  };

  const handleSaveReview = async (newReview) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      const reviewWithUserData = {
        ...newReview,
        userNameEffect: userData.nameEffect || "",
        userNameColor: userData.nameColor || "",
        isPro: userData.isPro || false,
        profilePicture: userData.profilePicture || null,
        userId: user.uid,
        gameId: id,
      };

      setReviews((prevReviews) => [...prevReviews, reviewWithUserData]);
      setGlobalReviews((prevGlobalReviews) => [
        ...prevGlobalReviews,
        reviewWithUserData,
      ]);

      setShowModal(false);
      toast.success("Reseña añadida con éxito");
    } catch (error) {
      console.error("Error al guardar la reseña:", error);
      toast.error("Ocurrió un error al guardar la reseña");
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      toast.error(
        "Necesitas iniciar sesión para marcar un juego como favorito."
      );
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
          coverImageUrl: game.coverImageUrl,
          likedAt: new Date().toISOString(),
        };

        if (isFavorite) {
          const updatedLikedGames = likedGames.filter(
            (g) => g.slug !== game.slug
          );
          await updateDoc(userRef, {
            likedGames: updatedLikedGames,
          });
          setIsFavorite(false);
          setFavoriteGamesCount((prev) => prev - 1);
          toast.success("Game removed from favorites.");
        } else {
          if (likedGames.length >= 6) {
            toast.error(
              "You can't add more than 6 favorite games. Please remove one to add another."
            );
            return;
          }
          await updateDoc(userRef, {
            likedGames: [...likedGames, gameToSave],
          });
          setIsFavorite(true);
          setFavoriteGamesCount((prev) => prev + 1);
          toast.success("Game added to favorites.");
        }
      }
    } catch (error) {
      console.error("Error al actualizar el estado de favorito:", error);
      toast.error("Ocurrió un error al actualizar el estado de favorito.");
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://gbxd-api.vercel.app/api/game/${id}`
        );
        if (!response.ok) {
          throw new Error(
            `Error en la red: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        setGame(data);

        const fetchReviews = async () => {
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("gameId", "==", id)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = await Promise.all(
            reviewsSnapshot.docs.map(async (reviewDoc) => {
              const reviewData = reviewDoc.data();
              const userDoc = await getDoc(doc(db, "users", reviewData.userId));
              const userData = userDoc.data();
              return {
                id: reviewDoc.id,
                ...reviewData,
                profilePicture: userData.profilePicture || null,
              };
            })
          );
          setReviews(reviewsData);
        };

        fetchReviews();

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const likedGames = userData.likedGames || [];
            setIsFavorite(likedGames.some((g) => g.slug === id));
            setFavoriteGamesCount(likedGames.length);
          }
        }
      } catch (error) {
        console.error("Error in fetchGameDetails:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();

    if (user) {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setUserPreferences({
            nameColor: userData.nameColor,
            nameEffect: userData.nameEffect,
            effectIntensity: userData.effectIntensity,
            isPro: userData.isPro,
          });
        }
      });

      return () => unsubscribe();
    }
  }, [id, user]);

  useEffect(() => {
    if (userPreferences && reviews.length > 0) {
      const updatedReviews = reviews.map((review) =>
        review.userId === user.uid ? { ...review, ...userPreferences } : review
      );
      if (JSON.stringify(updatedReviews) !== JSON.stringify(reviews)) {
        setReviews(updatedReviews);
      }
    }
  }, [userPreferences, user]);

  const renderUsername = (review) => {
    const style = getUsernameStyle(
      review.nameEffect || userPreferences?.nameEffect,
      review.nameColor || userPreferences?.nameColor,
      review.effectIntensity || userPreferences?.effectIntensity || 1
    );

    return (
      <Link href={`/profile/${review.userId}`}>
        <div className="flex items-center">
          {review.profilePicture && (
            <Image
              src={review.profilePicture}
              alt={`${review.username}'s profile`}
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
          )}
          <StyledUsername
            user={{ id: review.userId, username: review.username }}
            style={style}
            isPro={
              review.userId === user?.uid
                ? userPreferences?.isPro
                : review.isPro
            }
          />
        </div>
      </Link>
    );
  };

  useEffect(() => {
    const gameReviews = globalReviews.filter((review) => review.gameId === id);
    if (JSON.stringify(gameReviews) !== JSON.stringify(reviews)) {
      setReviews(gameReviews);
    }
  }, [id, globalReviews]);

  if (isLoading) {
    return (
      <div className="text-center h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-blue-900">
        <Loader className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!game) {
    return (
      <div className="text-center">
        No game found, please, try again later or reload the page.
      </div>
    );
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
        {user && !user.isPro && <UpgradeBanner />}
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
                          ? "bg-blue-600"
                          : "bg-gray-600 hover:bg-gray-700"
                      }`}
                      onClick={handleLikeClick}
                      disabled={!isFavorite && favoriteGamesCount >= 6}
                    >
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: isFavorite ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isFavorite ? (
                          <FaHeart className="inline-block text-blue-300" />
                        ) : (
                          <FaRegHeart className="inline-block" />
                        )}
                      </motion.div>
                    </motion.button>
                    {!isFavorite && favoriteGamesCount >= 6 && (
                      <p className="text-sm text-red-400 mt-2">
                        You have reached the maximum of 6 favorite games. Remove
                        one to add another.
                      </p>
                    )}
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
                      {reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="p-6 border border-gray-700 rounded-lg bg-gray-800 bg-opacity-50 shadow-md backdrop-blur-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            {renderUsername(review)}
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, index) => (
                              <span key={index}>
                                {index < review.rating ? (
                                  <FaStar className="text-yellow-400" />
                                ) : (
                                  <FaRegStar className="text-gray-400" />
                                )}
                              </span>
                            ))}
                            <span className="ml-2 text-gray-300">
                              {review.rating} / 5
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            {review.liked ? (
                              <>
                                <FaThumbsUp className="text-green-500 mr-2" />{" "}
                                Liked
                              </>
                            ) : (
                              <>
                                <FaThumbsDown className="text-red-500 mr-2" />{" "}
                                Disliked
                              </>
                            )}
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
            coverImageUrl: game.coverImageUrl,
          }}
          onClose={() => {
            console.log("Closing modal");
            setShowModal(false);
          }}
          onSave={handleSaveReview}
        />
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
