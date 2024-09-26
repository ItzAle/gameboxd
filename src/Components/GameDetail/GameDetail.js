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
  FaPlayCircle,
  FaCheckCircle,
  FaListUl,
  FaComment,
  FaTrash,
} from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import GoogleAdSense from "../Ads/GoogleAdSense";
import { Loader } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import Image from "next/image";
import AddReviewModal from "../AddReviewModal/AddReviewModal";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(true);

  const detailsVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleAddReviewClick = () => {
    if (!user) {
      toast.error("You need to login to add a review.");
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

  const toggleComments = (reviewId) => {
    setShowComments((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
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
      toast.success("Review added successfully");
    } catch (error) {
      console.error("Error al guardar la reseña:", error);
      toast.error("An error occurred while saving the review");
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      toast.error("You need to login to mark a game as a favorite.");
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

  const handleAddToLibrary = async (status) => {
    if (!user) {
      toast.error("You need to login to add games to your library.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const library = userData.library || [];

        const gameInLibrary = library.find((g) => g.slug === game.slug);

        if (gameInLibrary) {
          // Actualizar el estado si el juego ya está en la biblioteca
          const updatedLibrary = library.map((g) =>
            g.slug === game.slug
              ? {
                  ...g,
                  status,
                  genres: game.genres,
                  developer: game.developer,
                  publisher: game.publisher,
                }
              : g
          );
          await updateDoc(userRef, { library: updatedLibrary });
        } else {
          // Añadir el juego a la biblioteca si no está
          const gameToAdd = {
            slug: game.slug,
            name: game.name,
            coverImageUrl: game.coverImageUrl,
            status,
            genres: game.genres,
            developer: game.developer,
            publisher: game.publisher,
            addedAt: new Date().toISOString(),
          };
          await updateDoc(userRef, { library: [...library, gameToAdd] });
        }
        setLibraryStatus(status);
        toast.success(
          `Game ${
            status === "playing"
              ? "marked as playing"
              : status === "completed"
              ? "marked as completed"
              : "added to tracking list"
          }.`
        );
      }
    } catch (error) {
      console.error("Error updating the library:", error);
      toast.error("An error occurred while updating the library.");
    }
  };
  const handleAddComment = async (reviewId, commentText) => {
    if (!user) {
      toast.error("You need to login to comment.");
      return;
    }

    try {
      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        username: user.displayName || "Usuario anónimo",
        text: commentText,
        createdAt: new Date().toISOString(),
        editedAt: null,
      };

      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        comments: arrayUnion(newComment),
      });

      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, comments: [...(review.comments || []), newComment] }
            : review
        )
      );

      toast.success("Comentario añadido con éxito");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An error occurred while adding the comment");
    }
  };

  const handleEditComment = async (reviewId, commentId, newText) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      const reviewData = reviewDoc.data();

      const updatedComments = reviewData.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, text: newText, editedAt: new Date().toISOString() }
          : comment
      );

      await updateDoc(reviewRef, { comments: updatedComments });

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? { ...review, comments: updatedComments }
            : review
        )
      );

      setEditingComment(null);
      toast.success("Comentario actualizado con éxito");
    } catch (error) {
      console.error("Error editing comment:", error);
      toast.error("An error occurred while editing the comment");
    }
  };

  const handleDeleteComment = async (reviewId, commentId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      const reviewDoc = await getDoc(reviewRef);
      const reviewData = reviewDoc.data();

      const updatedComments = reviewData.comments.filter(
        (comment) => comment.id !== commentId
      );

      await updateDoc(reviewRef, { comments: updatedComments });

      setReviews(
        reviews.map((review) =>
          review.id === reviewId
            ? { ...review, comments: updatedComments }
            : review
        )
      );

      toast.success("Comentario eliminado con éxito");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting the comment");
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
                username: userData.username,
                profilePicture: userData.profilePicture || null,
                nameEffect: userData.nameEffect,
                nameColor: userData.nameColor,
                effectIntensity: userData.effectIntensity,
                isPro: userData.isPro,
                comments: reviewData.comments || [],
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

            const library = userData.library || [];
            const gameInLibrary = library.find((g) => g.slug === id);
            setLibraryStatus(gameInLibrary ? gameInLibrary.status : null);
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
  }, [id, user]);

  const renderComments = (review) => (
    <div className="mt-4">
      {review.comments &&
        review.comments.map((comment) => (
          <div key={comment.id} className="bg-gray-600 rounded p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{comment.username}</span>
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
                {comment.editedAt && " (edited)"}
              </span>
            </div>
            {editingComment === comment.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditComment(
                    review.id,
                    comment.id,
                    e.target.elements.editedComment.value
                  );
                }}
              >
                <textarea
                  name="editedComment"
                  defaultValue={comment.text}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingComment(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p>{comment.text}</p>
                {user && user.uid === comment.userId && (
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setEditingComment(comment.id)}
                      className="text-blue-400 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteComment(review.id, comment.id)}
                      className="text-red-400"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      <AddCommentForm reviewId={review.id} onCommentAdded={handleAddComment} />
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8"
      >
        <TransparentNavbar />
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-12 w-12 text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>Error: {error.message}</p>
          </div>
        ) : game ? (
          <div className="max-w-7xl mx-auto mt-24">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Columna izquierda: Imagen y acciones */}
              <div className="lg:w-1/3">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-4xl font-bold mb-4 text-blue-300">
                    {game.name}
                  </h1>
                  <img
                    src={game.coverImageUrl}
                    alt={`${game.name} cover`}
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <p className="text-gray-300 mb-4">
                    Release date:{" "}
                    {game.releaseDate
                      ? new Date(game.releaseDate).toLocaleDateString()
                      : "No release date available"}
                  </p>
                  <div className="flex justify-between mb-4">
                    <button
                      onClick={handleLikeClick}
                      className={`flex items-center justify-center px-4 py-2 rounded-full ${
                        isFavorite
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      } transition duration-300`}
                    >
                      {isFavorite ? <FaHeart /> : <FaRegHeart />}
                      <span className="ml-2">
                        {isFavorite ? "Favorite" : "Add to favorites"}
                      </span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={() => handleAddToLibrary("playing")}
                      className={`flex flex-col items-center justify-center p-2 rounded ${
                        libraryStatus === "playing"
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      } transition duration-300`}
                    >
                      <FaPlayCircle className="text-2xl mb-1" />
                      <span className="text-xs">Playing</span>
                    </button>
                    <button
                      onClick={() => handleAddToLibrary("completed")}
                      className={`flex flex-col items-center justify-center p-2 rounded ${
                        libraryStatus === "completed"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      } transition duration-300`}
                    >
                      <FaCheckCircle className="text-2xl mb-1" />
                      <span className="text-xs">Completed</span>
                    </button>
                    <button
                      onClick={() => handleAddToLibrary("toPlay")}
                      className={`flex flex-col items-center justify-center p-2 rounded ${
                        libraryStatus === "toPlay"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      } transition duration-300`}
                    >
                      <FaListUl className="text-2xl mb-1" />
                      <span className="text-xs">To play</span>
                    </button>
                  </div>
                  {/* Botones de tienda */}
                  {game.storeLinks &&
                    Object.entries(game.storeLinks).length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {Object.entries(game.storeLinks).map(
                          ([store, link]) => {
                            let Icon;
                            let storeName = store;
                            switch (store.toLowerCase()) {
                              case "steam":
                                Icon = FaSteam;
                                storeName = "Steam";
                                break;
                              case "playstation":
                                Icon = FaPlaystation;
                                storeName = "PlayStation";
                                break;
                              case "xbox":
                                Icon = FaXbox;
                                storeName = "Xbox";
                                break;
                              case "nintendo":
                                Icon = FaGamepad;
                                storeName = "Nintendo";
                                break;
                              case "epicgames":
                                Icon = FaDesktop;
                                storeName = "Epic Games";
                                break;
                              default:
                                Icon = FaGamepad;
                            }
                            return (
                              <a
                                key={store}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center"
                              >
                                <Icon className="mr-2" /> {storeName}
                              </a>
                            );
                          }
                        )}
                      </div>
                    )}
                </motion.div>
              </div>

              {/* Columna derecha: Detalles del juego y reseñas */}
              <div className="lg:w-2/3">
                {/* Detalles del juego */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-gray-800 rounded-lg p-6 mb-8"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Game Details</h2>
                    <button
                      onClick={() => setShowGameDetails(!showGameDetails)}
                      className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition duration-300"
                    >
                      {showGameDetails ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showGameDetails && (
                      <motion.div
                        variants={detailsVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {/* Descripción */}
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold mb-2">
                            Descripción
                          </h3>
                          <p className="text-gray-300">{game.description}</p>
                        </div>

                        {/* Plataformas y Géneros */}
                        <div className="mb-6 flex flex-wrap">
                          <div className="w-full sm:w-1/2 mb-4 sm:mb-0 pr-2">
                            <h3 className="text-xl font-semibold mb-2">
                              Plataformas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {game.platforms &&
                                game.platforms.map((platform, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 px-2 py-1 rounded-full text-sm"
                                  >
                                    {platform}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="w-full sm:w-1/2 pl-2">
                            <h3 className="text-xl font-semibold mb-2">
                              Géneros
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {game.genres &&
                                game.genres.map((genre, index) => (
                                  <span
                                    key={index}
                                    className="bg-gray-700 px-2 py-1 rounded-full text-sm"
                                  >
                                    {genre}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Desarrollador y Editor */}
                        <div className="flex flex-wrap">
                          <div className="w-full sm:w-1/2 mb-4 sm:mb-0 pr-2">
                            <h3 className="text-xl font-semibold mb-2">
                              Desarrollador
                            </h3>
                            <p className="text-gray-300">{game.developer}</p>
                          </div>
                          <div className="w-full sm:w-1/2 pl-2">
                            <h3 className="text-xl font-semibold mb-2">
                              Editor
                            </h3>
                            <p className="text-gray-300">{game.publisher}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                {/* Sección de reseñas */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gray-800 rounded-lg p-6"
                >
                  <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                  <button
                    onClick={handleAddReviewClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 transition duration-300"
                  >
                    Add a review
                  </button>
                  {/* Lista de reseñas */}
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-gray-700 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center mb-2">
                        <img
                          src={review.profilePicture || "/default-avatar.png"}
                          alt={`${review.username}'s avatar`}
                          className="w-10 h-10 rounded-full mr-2"
                        />
                        <div>
                          <StyledUsername
                            user={{ username: review.username }}
                            style={{ color: review.nameColor }}
                            isPro={review.isPro}
                          />
                          {review.isPro && <ProBadge />}
                        </div>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }
                          />
                        ))}
                      </div>
                      <p className="text-gray-300 mb-2">{review.comment}</p>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaCalendarAlt className="mr-1" />
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleComments(review.id)}
                        className="mt-2 text-blue-400 hover:text-blue-500"
                      >
                        {showComments[review.id]
                          ? "Hide comments"
                          : "Show comments"}
                      </button>
                      {showComments[review.id] && renderComments(review)}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      {showModal && (
        <AddReviewModal
          game={{
            slug: game.slug,
            name: game.name,
            coverImageUrl: game.coverImageUrl,
          }}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReview}
        />
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

const AddCommentForm = ({ reviewId, onCommentAdded }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      onCommentAdded(reviewId, comment.trim());
      setComment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-2 bg-gray-700 text-white rounded"
        placeholder="Add a comment..."
      />
      <button
        type="submit"
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add comment
      </button>
    </form>
  );
};
