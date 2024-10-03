"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
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
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import GoogleAdSense from "../Ads/GoogleAdSense";
import { Loader2 } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import Image from "next/image";
import AddReviewModal from "../AddReviewModal/AddReviewModal";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";
import { useHalloween } from "../../context/HalloweenContext";
import HalloweenParticles from "../HalloweenParticles";
import "../../styles/halloween.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import ReactPlayer from "react-player/lazy";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

const MemoizedTransparentNavbar = React.memo(TransparentNavbar);
const MemoizedGoogleAdSense = React.memo(GoogleAdSense);
const MemoizedUpgradeBanner = React.memo(UpgradeBanner);
const MemoizedAddReviewModal = React.memo(AddReviewModal);

const ReviewCard = React.memo(
  ({
    review,
    user,
    onToggleComments,
    showComments,
    onAddComment,
    onEditComment,
    onDeleteComment,
    editingComment,
    setEditingComment,
  }) => (
    <div key={review.id} className="bg-slate-800 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Link href={`/user/${review.userId}`}>
          <p>
            <img
              src={review.profilePicture || "/default-avatar.png"}
              alt={`${review.username}'s avatar`}
              className="w-10 h-10 rounded-full mr-2 cursor-pointer"
            />
          </p>
        </Link>
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <Link href={`/user/${review.userId}`}>
              <p>
                <StyledUsername
                  user={{ username: review.username }}
                  style={{ color: review.nameColor }}
                  isPro={review.isPro}
                  className="cursor-pointer hover:underline"
                />
              </p>
            </Link>
            {review.isPro && <ProBadge className="ml-2" />}
          </div>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={
                  i < review.rating ? "text-yellow-400" : "text-gray-400"
                }
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-300 mb-2">{review.comment}</p>
      <div className="flex items-center text-sm text-gray-400">
        <FaCalendarAlt className="mr-1" />
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      <button
        onClick={() => onToggleComments(review.id)}
        className="mt-2 text-blue-400 hover:text-blue-500"
      >
        {showComments[review.id] ? "Hide comments" : "Show comments"}
      </button>
      {showComments[review.id] && (
        <div className="mt-4">
          {review.comments &&
            review.comments.map((comment) => (
              <div key={comment.id} className="bg-slate-700 rounded p-3 mb-2">
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
                      onEditComment(
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
                          onClick={() => onDeleteComment(review.id, comment.id)}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddComment(review.id, e.target.elements.newComment.value);
              e.target.reset();
            }}
          >
            <textarea
              name="newComment"
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
        </div>
      )}
    </div>
  )
);

ReviewCard.displayName = "ReviewCard";

const YouTubePlayer = React.memo(({ videoId }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          loop: 1,
          playlist: videoId,
          mute: 1, // Necesario para la reproducción automática en la mayoría de los navegadores
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackQuality("hd720");
            event.target.playVideo();
          },
        },
      });
    };
  }, [videoId]);

  return (
    <div className="relative aspect-w-16 aspect-h-9">
      <div ref={playerRef} className="absolute inset-0"></div>
    </div>
  );
});

YouTubePlayer.displayName = "YouTubePlayer";

// Función auxiliar para formatear la fecha
const formatReleaseDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";

  try {
    const date = parseISO(dateString);
    return format(date, "d MMM yyyy");
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return dateString; // Devuelve la fecha original si hay un error
  }
};

export default function GameDetailsPage({ id, initialGameData }) {
  const { user } = useAuth();
  const [game, setGame] = useState(initialGameData);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { reviews: globalReviews, setReviews: setGlobalReviews } = useReviews();
  const [isLoading, setIsLoading] = useState(!initialGameData);
  const [favoriteGamesCount, setFavoriteGamesCount] = useState(0);
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(true);
  const { isHalloweenMode } = useHalloween();
  const [showMediaSection, setShowMediaSection] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const router = useRouter();

  const detailsVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3 },
      },
      visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3 },
      },
    }),
    []
  );

  const mediaVariants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3 },
      },
      visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3 },
      },
    }),
    []
  );

  const handleAddReviewClick = useCallback(() => {
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
  }, [user, reviews]);

  const toggleComments = useCallback((reviewId) => {
    setShowComments((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  }, []);

  const handleSaveReview = useCallback(
    async (newReview) => {
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
    },
    [user, id, setGlobalReviews]
  );

  const handleLikeClick = useCallback(async () => {
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
  }, [user, game, isFavorite]);

  const handleAddToLibrary = useCallback(
    async (status) => {
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
    },
    [user, game]
  );

  const handleAddComment = useCallback(
    async (reviewId, commentText) => {
      if (!user) {
        toast.error("Necesitas iniciar sesión para comentar.");
        return;
      }

      try {
        // Obtener los datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const username = userData.username || "Usuario anónimo";

        const newComment = {
          id: Date.now().toString(),
          userId: user.uid,
          username: username,
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
              ? {
                  ...review,
                  comments: [...(review.comments || []), newComment],
                }
              : review
          )
        );

        toast.success("Comentario añadido con éxito");
      } catch (error) {
        console.error("Error al añadir el comentario:", error);
        toast.error("Ocurrió un error al añadir el comentario");
      }
    },
    [user, reviews]
  );

  const handleEditComment = useCallback(
    async (reviewId, commentId, newText) => {
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
    },
    []
  );

  const handleDeleteComment = useCallback(
    async (reviewId, commentId) => {
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
    },
    [reviews]
  );

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const renderDescription = (description) => {
    const shortDescription = description.slice(0, 150) + "...";

    return (
      <>
        <p className="text-gray-300 mb-2">
          {showFullDescription ? description : shortDescription}
        </p>
        {description.length > 150 && (
          <button
            onClick={toggleDescription}
            className="text-blue-400 hover:underline"
          >
            {showFullDescription ? "Read Less" : "Read More"}
          </button>
        )}
      </>
    );
  };

  const handleFilterClick = (type, value) => {
    router.push(`/all?${type}=${encodeURIComponent(value)}`);
  };

  const renderFilterableItem = (item, type) => (
    <Link
      href={`/all?${type}=${encodeURIComponent(item)}`}
      key={item}
      className="bg-gray-700 px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-600 transition-colors duration-200"
    >
      {item}
    </Link>
  );

  const fetchGameDetails = useCallback(async () => {
    if (initialGameData) {
      setGame(initialGameData);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.gameboxd.me/api/game/${id}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      if (!response.ok) {
        throw new Error(
          `Error en la red: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error("Error fetching game details:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, initialGameData]);

  const fetchReviews = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchGameDetails();
    fetchReviews();
  }, [fetchGameDetails, fetchReviews]);

  const isHorrorGame = game && game.genres && game.genres.includes("Horror");

  const halloweenOverlayStyle =
    isHalloweenMode && isHorrorGame
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
          zIndex: 1,
        }
      : {};

  const containerClass = `min-h-screen  bg-gradient-to-b from-gray-900 to-black text-white relative ${
    isHalloweenMode && isHorrorGame ? "halloween-mode" : ""
  }`;

  const halloweenClass =
    isHalloweenMode && isHorrorGame ? "halloween-text" : "";
  const halloweenClassLight =
    isHalloweenMode && isHorrorGame ? "halloween-text-light" : "";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-red-500 text-xl  bg-gradient-to-b from-gray-900 to-black p-6 rounded-lg shadow-lg">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`min-h-screen ${containerClass}`}
      >
        {isHalloweenMode && isHorrorGame && (
          <>
            <div style={halloweenOverlayStyle}></div>
            <HalloweenParticles />
          </>
        )}

        <div className="relative z-10 ">
          <MemoizedTransparentNavbar />
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="animate-spin text-white" />
            </div>
          ) : game ? (
            (() => {
              const hasMediaContent =
                game.images?.length > 0 || game.videos?.length > 0;

              return (
                <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h1
                            className={`text-4xl font-bold ${halloweenClass}`}
                          >
                            {game.name}
                          </h1>
                          <button
                            onClick={handleLikeClick}
                            className="text-2xl"
                            title={
                              isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            {isFavorite ? (
                              <FaHeart className="text-red-500" />
                            ) : (
                              <FaRegHeart />
                            )}
                          </button>
                        </div>
                        <img
                          src={game.coverImageUrl}
                          alt={`${game.name} cover`}
                          className="w-full rounded-lg shadow-lg mb-4"
                        />
                        <p className="text-gray-400 mb-4">
                          Release date: {formatReleaseDate(game.releaseDate)}
                        </p>
                        <button
                          onClick={handleAddReviewClick}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4 w-full transition duration-300"
                        >
                          Add a review
                        </button>

                        {/* Botones de estado de juego */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <button
                            onClick={() => handleAddToLibrary("playing")}
                            className={`flex flex-col items-center justify-center p-2 rounded ${
                              libraryStatus === "playing"
                                ? `bg-blue-500 hover:bg-blue-600 `
                                : `bg-gray-700 hover:bg-gray-600 `
                            } transition duration-300`}
                          >
                            <FaPlayCircle className="text-2xl mb-1" />
                            <span className="text-xs">Playing</span>
                          </button>
                          <button
                            onClick={() => handleAddToLibrary("completed")}
                            className={`flex flex-col items-center justify-center p-2 rounded ${
                              libraryStatus === "completed"
                                ? `bg-green-500 hover:bg-green-600 `
                                : `bg-gray-700 hover:bg-gray-600 `
                            } transition duration-300`}
                          >
                            <FaCheckCircle className="text-2xl mb-1" />
                            <span className="text-xs">Completed</span>
                          </button>
                          <button
                            onClick={() => handleAddToLibrary("toPlay")}
                            className={`flex flex-col items-center justify-center p-2 rounded ${
                              libraryStatus === "toPlay"
                                ? `bg-yellow-500 hover:bg-yellow-600 `
                                : `bg-gray-700 hover:bg-gray-600 `
                            } transition duration-300`}
                          >
                            <FaListUl className="text-2xl mb-1" />
                            <span className="text-xs">To play</span>
                          </button>
                        </div>

                        {/* Botones de tiendas */}
                        <div className="grid grid-cols-1 gap-2 mb-4">
                          {game.storeLinks &&
                            Object.entries(game.storeLinks)
                              .filter(([store, link]) => link)
                              .map(([store, link]) => {
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
                                    className="bg-slate-800 hover:bg-gray-400 transition duration-300 text-white px-4 py-2 rounded flex items-center justify-center"
                                  >
                                    <Icon className="mr-2" /> {storeName}
                                  </a>
                                );
                              })}
                        </div>

                        {hasMediaContent && (
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className=" rounded-lg p-4 mb-8 bg-slate-800"
                          >
                            {/* Sección de información del juego */}
                            <h2
                              className={`text-2xl font-semibold mb-4 ${halloweenClass}`}
                            >
                              Game Details
                            </h2>

                            <h3
                              className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                            >
                              Description
                            </h3>
                            {renderDescription(game.description)}

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3
                                  className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                                >
                                  Platforms
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {game.platforms &&
                                    game.platforms.map((platform) =>
                                      renderFilterableItem(platform, "platform")
                                    )}
                                </div>
                              </div>
                              <div>
                                <h3
                                  className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                                >
                                  Genres
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {game.genres &&
                                    game.genres.map((genre) =>
                                      renderFilterableItem(genre, "genre")
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <h3
                                  className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                                >
                                  Developer
                                </h3>
                                <p className="text-gray-300">
                                  {renderFilterableItem(
                                    game.developer,
                                    "developer"
                                  )}
                                </p>
                              </div>
                              <div>
                                <h3
                                  className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                                >
                                  Publisher
                                </h3>
                                <p className="text-gray-300">
                                  {renderFilterableItem(
                                    game.publisher,
                                    "publisher"
                                  )}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    <div className="lg:w-2/3">
                      {!hasMediaContent && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="rounded-lg p-2 mb-8"
                        >
                          {/* Sección de información del juego */}
                          <h2
                            className={`text-2xl font-semibold mb-4 ${halloweenClass}`}
                          >
                            Game Details
                          </h2>

                          <h3
                            className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                          >
                            Description
                          </h3>
                          {renderDescription(game.description)}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3
                                className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                              >
                                Platforms
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {game.platforms &&
                                  game.platforms.map((platform) =>
                                    renderFilterableItem(platform, "platform")
                                  )}
                              </div>
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                              >
                                Genres
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {game.genres &&
                                  game.genres.map((genre) =>
                                    renderFilterableItem(genre, "genre")
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <h3
                                className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                              >
                                Developer
                              </h3>
                              <p className="text-gray-300">
                                {renderFilterableItem(
                                  game.developer,
                                  "developer"
                                )}
                              </p>
                            </div>
                            <div>
                              <h3
                                className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                              >
                                Publisher
                              </h3>
                              <p className="text-gray-300">
                                {renderFilterableItem(
                                  game.publisher,
                                  "publisher"
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {hasMediaContent && (
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className=" p-2"
                        >
                          <h2
                            className={`text-2xl font-semibold mb-4 ${halloweenClass}`}
                          >
                            Images and Videos
                          </h2>
                          <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={30}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{
                              delay: 10000, // 10 segundos
                              disableOnInteraction: false, // Continúa el autoplay después de la interacción del usuario
                            }}
                            className="mb-6"
                          >
                            {game.images?.map((image, index) => (
                              <SwiperSlide key={`image-${index}`}>
                                <img
                                  src={image.url}
                                  alt={
                                    image.description ||
                                    `${game.name} image ${index + 1}`
                                  }
                                  width={800}
                                  height={450}
                                  className="rounded-lg object-cover w-full h-auto"
                                />
                              </SwiperSlide>
                            ))}
                            {game.videos?.map((video, index) => (
                              <SwiperSlide key={`video-${index}`}>
                                <YouTubePlayer
                                  videoId={getYouTubeVideoId(video.url)}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </motion.div>
                      )}

                      {/* Sección de reviews */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="p-2"
                      >
                        <h2
                          className={`text-2xl font-semibold mb-4 ${halloweenClass}`}
                        >
                          Reviews
                        </h2>
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              user={user}
                              onToggleComments={toggleComments}
                              showComments={showComments}
                              onAddComment={handleAddComment}
                              onEditComment={handleEditComment}
                              onDeleteComment={handleDeleteComment}
                              editingComment={editingComment}
                              setEditingComment={setEditingComment}
                            />
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-4">
                            No hay reseñas aún,{" "}
                            <span
                              onClick={handleAddReviewClick}
                              className="text-blue-400 hover:underline cursor-pointer"
                            >
                              puedes añadir una haciendo clic aquí
                            </span>
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}
        </div>

        {showModal && (
          <MemoizedAddReviewModal
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
      </motion.div>
    </div>
  );
}

function getYouTubeVideoId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
