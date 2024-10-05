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
  FaLightbulb,
  FaTimes,
} from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import GoogleAdSense from "../Ads/GoogleAdSense";
import { Loader2 } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
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
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import "../../index.css";
import YouTube from "react-youtube";
import { BsGrid3X3GapFill, BsListUl } from "react-icons/bs";
import "../../utils/customScrollbar.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { SiNintendoswitch, SiEpicgames, SiGogdotcom } from "react-icons/si";

const MemoizedTransparentNavbar = React.memo(TransparentNavbar);
const MemoizedGoogleAdSense = React.memo(GoogleAdSense);
const MemoizedUpgradeBanner = React.memo(UpgradeBanner);
const MemoizedAddReviewModal = React.memo(AddReviewModal);

// Review Card (Hay que separla en un compente)
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

// Fin review card

// Función para obtener el ID del video de YouTube
// No hace falta separar por componente
//Compon

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const CustomVideoPlayer = React.memo(({ videoUrl, isVisible, onReady }) => {
  const videoId = getYouTubeVideoId(videoUrl);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      mute: 1,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1,
      loop: 1,
      playlist: videoId,
      origin: window.location.origin,
    },
  };

  const onPlayerReady = useCallback(
    (event) => {
      onReady(event.target);
    },
    [onReady]
  );

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onPlayerReady}
        className="youtube-player"
      />
    </div>
  );
});

const ImageVideoPlayer = React.memo(
  ({
    imageUrl,
    videoUrl,
    onDoubleClick,
    isPlaying,
    setIsPlaying,
    gameName,
    isFavorite,
    onToggleFavorite,
  }) => {
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [showBanner, setShowBanner] = useState(true);
    const playerRef = useRef(null);
    const videoId = getYouTubeVideoId(videoUrl);
    const bannerTimeoutRef = useRef(null);

    useEffect(() => {
      const bannerDismissed = localStorage.getItem("videoBannerDismissed");
      if (bannerDismissed) {
        setShowBanner(false);
      } else {
        bannerTimeoutRef.current = setTimeout(() => {
          setShowBanner(false);
        }, 5000); // Banner disappears after 5 seconds
      }

      return () => {
        if (bannerTimeoutRef.current) {
          clearTimeout(bannerTimeoutRef.current);
        }
      };
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsVideoVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      if (!isPlaying) {
        setIsVideoVisible(false);
      }
    }, [isPlaying]);

    const handleClick = useCallback(() => {
      setIsPlaying(!isPlaying);
    }, [isPlaying, setIsPlaying]);

    const handleDoubleClick = useCallback(
      (event) => {
        event.preventDefault();
        onDoubleClick(videoUrl);
      },
      [onDoubleClick, videoUrl]
    );

    const dismissBanner = useCallback(() => {
      setShowBanner(false);
      localStorage.setItem("videoBannerDismissed", "true");
    }, []);

    const onReady = useCallback((event) => {
      playerRef.current = event.target;
      setIsPlayerReady(true);
    }, []);

    const safePlayerCall = useCallback(
      (method) => {
        if (isPlayerReady && playerRef.current) {
          if (typeof playerRef.current[method] === "function") {
            try {
              playerRef.current[method]();
            } catch (error) {}
          } else {
          }
        } else {
        }
      },
      [isPlayerReady]
    );

    useEffect(() => {
      if (isPlaying) {
        safePlayerCall("playVideo");
      } else {
        safePlayerCall("pauseVideo");
      }
    }, [isPlaying, safePlayerCall]);

    useEffect(() => {
      return () => {
        if (
          playerRef.current &&
          typeof playerRef.current.destroy === "function"
        ) {
          playerRef.current.destroy();
        }
      };
    }, []);

    return (
      <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg select-none">
        <AnimatePresence>
          {showBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded-lg z-20 flex items-center"
            >
              <FaLightbulb className="mr-2 text-yellow-400" />
              <span className="text-sm">
                Hover: Preview video | Click: Play/Pause | Double-click:
                Fullscreen
              </span>
              <button
                onClick={dismissBanner}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nombre del juego y botón de favoritos */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-white text-2xl font-bold">{gameName}</h2>
            <button
              onClick={onToggleFavorite}
              className="text-white hover:text-red-500 transition-colors duration-200"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500" size={24} />
              ) : (
                <FaRegHeart size={24} />
              )}
            </button>
          </div>
        </div>

        <div
          className="absolute inset-0 w-full h-full"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={imageUrl}
            alt="Game preview"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            draggable="false"
          />
          {videoId && (isVideoVisible || isPlaying) && (
            <div className="absolute inset-0 youtube-container rounded-lg">
              <YouTube
                videoId={videoId}
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: {
                    autoplay: 1,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    mute: 1,
                    loop: 1,
                    playlist: videoId,
                    iv_load_policy: 3,
                    fs: 0,
                  },
                }}
                onReady={onReady}
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

ImageVideoPlayer.displayName = "ImageVideoPlayer";
CustomVideoPlayer.displayName = "CustomVideoPlayer";

// Función auxiliar para formatear la fecha
const formatReleaseDate = (dateString) => {
  if (!dateString) return "Fecha no disponible";

  try {
    const date = parseISO(dateString);
    return format(date, "d MMM yyyy");
  } catch (error) {
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
  const swiperRef = useRef(null);
  const playerRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    const savedLayout = localStorage.getItem("preferredLayout");
    return savedLayout === "compact";
  });

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && game) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const likedGames = userData.likedGames || [];
          const isGameFavorite = likedGames.some((g) => g.slug === game.slug);
          setIsFavorite(isGameFavorite);
        }
      }
    };

    checkFavoriteStatus();
  }, [user, game]);

  useEffect(() => {
    const loadLibraryStatus = async () => {
      if (user && game) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const library = userData.library || [];
            const gameInLibrary = library.find((g) => g.slug === game.slug);
            if (gameInLibrary) {
              setLibraryStatus(gameInLibrary.status);
            } else {
              setLibraryStatus(null);
            }
          }
        } catch (error) {
          console.error("Error loading library status:", error);
        }
      }
    };

    loadLibraryStatus();
  }, [user, game]);

  const toggleLayout = useCallback(() => {
    setIsCompactLayout((prevLayout) => {
      const newLayout = !prevLayout;
      localStorage.setItem(
        "preferredLayout",
        newLayout ? "compact" : "original"
      );
      return newLayout;
    });
  }, []);

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  }, []);

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
      toast.error("An error occurred while marking the game as a favorite.");
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

        toast.success("Comment added successfully");
      } catch (error) {
        toast.error("An error occurred while adding the comment");
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
            className="text-blue-400 hover:underline select-none cursor-pointer"
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
      className="bg-gray-700 px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-600 transition-colors duration-200 select-none"
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
    } catch (error) {}
  }, [id]);

  useEffect(() => {
    fetchGameDetails();
    fetchReviews();
  }, [fetchGameDetails, fetchReviews]);

  useEffect(() => {
    const checkVideoEnd = setInterval(() => {
      if (
        playerRef.current &&
        playerRef.current.getCurrentTime() === playerRef.current.getDuration()
      ) {
        if (swiperRef.current) {
          swiperRef.current.slideNext();
        }
        clearInterval(checkVideoEnd);
      }
    }, 1000);

    return () => clearInterval(checkVideoEnd);
  }, []);

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

  const halloweenClass =
    isHalloweenMode && isHorrorGame ? "halloween-text" : "";

  const LayoutToggleButton = ({ isCompactLayout, toggleLayout }) => {
    return (
      <motion.button
        onClick={toggleLayout}
        className="fixed top-20 right-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg transition duration-300 z-50 hidden lg:flex items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCompactLayout ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isCompactLayout ? (
            <BsListUl className="text-xl" />
          ) : (
            <BsGrid3X3GapFill className="text-xl" />
          )}
        </motion.div>
        <motion.span
          className="ml-2 text-sm font-medium"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {isCompactLayout ? " " : ""}
        </motion.span>
      </motion.button>
    );
  };

  const handleVideoDoubleClick = useCallback((videoUrl) => {
    setFullscreenVideo(videoUrl);
    setIsPlaying(false);
  }, []);

  const closeFullscreenVideo = useCallback(() => {
    setFullscreenVideo(null);
    // Opcional: decir si quieres reanudar la reproduccion del video pequeño o no
    // setIsPlaying(true);
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05,
        duration: 0.01,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen relative"
      >
        {isHalloweenMode && isHorrorGame && (
          <>
            <div style={halloweenOverlayStyle}></div>
            <HalloweenParticles />
          </>
        )}

        <div className="relative z-10">
          <MemoizedTransparentNavbar />
          <LayoutToggleButton
            isCompactLayout={isCompactLayout}
            toggleLayout={toggleLayout}
          />
          {isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="animate-spin text-white" />
            </div>
          ) : game ? (
            isCompactLayout ? (
              // Diseño compacto
              <motion.div
                className="max-w-full mx-auto pt-16 px-4 sm:px-6 lg:px-8 h-[calc(100vh-64px)] flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden"
                  variants={containerVariants}
                >
                  {/* Columna izquierda */}
                  <motion.div
                    className="lg:w-5/12 flex flex-col"
                    variants={itemVariants}
                  >
                    <ImageVideoPlayer
                      key={game.id}
                      imageUrl={game.coverImageUrl}
                      videoUrl={game.videos?.[0]?.url}
                      onDoubleClick={handleVideoDoubleClick}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      gameName={game.name}
                      isFavorite={isFavorite}
                      onToggleFavorite={handleLikeClick}
                    />
                    <motion.p
                      className="text-gray-400 text-sm mt-2"
                      variants={itemVariants}
                    >
                      Release date: {formatReleaseDate(game.releaseDate)}
                    </motion.p>
                    <motion.button
                      onClick={handleAddReviewClick}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2 transition duration-300 text-sm"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add a review
                    </motion.button>
                    <motion.div
                      className="grid grid-cols-3 gap-2 mt-2"
                      variants={containerVariants}
                    >
                      <motion.button
                        onClick={() => handleAddToLibrary("playing")}
                        className={`flex flex-col items-center justify-center p-1 rounded text-xs ${
                          libraryStatus === "playing"
                            ? `bg-blue-500 hover:bg-blue-600`
                            : `bg-gray-700 hover:bg-gray-600`
                        } transition duration-300`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaPlayCircle className="text-lg mb-1" />
                        <span>Playing</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleAddToLibrary("completed")}
                        className={`flex flex-col items-center justify-center p-1 rounded text-xs ${
                          libraryStatus === "completed"
                            ? `bg-green-500 hover:bg-green-600`
                            : `bg-gray-700 hover:bg-gray-600`
                        } transition duration-300`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaCheckCircle className="text-lg mb-1" />
                        <span>Completed</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleAddToLibrary("toPlay")}
                        className={`flex flex-col items-center justify-center p-1 rounded text-xs ${
                          libraryStatus === "toPlay"
                            ? `bg-yellow-500 hover:bg-yellow-600`
                            : `bg-gray-700 hover:bg-gray-600`
                        } transition duration-300`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaListUl className="text-lg mb-1" />
                        <span>To play</span>
                      </motion.button>
                    </motion.div>
                    <motion.div
                      className="grid grid-cols-1 gap-2 mt-2"
                      variants={containerVariants}
                    >
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
                              case "nintendoswitch":
                                Icon = SiNintendoswitch;
                                storeName = "Nintendo Switch";
                                break;
                              case "xbox":
                                Icon = FaXbox;
                                storeName = "Xbox";
                                break;
                              case "epicgames":
                                Icon = SiEpicgames;
                                storeName = "Epic Games";
                                break;
                              case "gog":
                                Icon = SiGogdotcom;
                                storeName = "GOG";
                                break;
                              default:
                                Icon = FaGamepad;
                            }
                            return (
                              <motion.a
                                key={store}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-800 hover:bg-gray-700 transition duration-300 text-white px-4 py-2 rounded flex items-center justify-center text-sm"
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Icon className="mr-2" /> {storeName}
                              </motion.a>
                            );
                          })}
                    </motion.div>
                  </motion.div>

                  {/* Columna derecha */}
                  <motion.div
                    className="lg:w-7/12 flex flex-col overflow-hidden"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="flex-grow overflow-y-auto pr-4"
                      variants={containerVariants}
                    >
                      <motion.h2
                        className={`text-xl font-semibold mb-2 ${halloweenClass}`}
                        variants={itemVariants}
                      >
                        Game Details
                      </motion.h2>
                      <motion.div className="text-sm" variants={itemVariants}>
                        <h3 className={`font-semibold ${halloweenClass}`}>
                          Description
                        </h3>
                        {renderDescription(game.description)}
                      </motion.div>
                      <motion.div
                        className="grid grid-cols-2 gap-4 mt-4 text-sm"
                        variants={containerVariants}
                      >
                        <motion.div variants={itemVariants}>
                          <h3
                            className={`font-semibold ${halloweenClass} mb-1`}
                          >
                            Platforms
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {game.platforms &&
                              game.platforms.map((platform) =>
                                renderFilterableItem(platform, "platform")
                              )}
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <h3
                            className={`font-semibold ${halloweenClass} mb-1`}
                          >
                            Genres
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {game.genres &&
                              game.genres.map((genre) =>
                                renderFilterableItem(genre, "genre")
                              )}
                          </div>
                        </motion.div>
                      </motion.div>
                      <motion.div
                        className="grid grid-cols-2 gap-4 mt-4 text-sm"
                        variants={containerVariants}
                      >
                        <motion.div variants={itemVariants}>
                          <h3
                            className={`font-semibold ${halloweenClass} mb-1`}
                          >
                            Developer
                          </h3>
                          <div>
                            {renderFilterableItem(game.developer, "developer")}
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <h3
                            className={`font-semibold ${halloweenClass} mb-1`}
                          >
                            Publisher
                          </h3>
                          <div>
                            {renderFilterableItem(game.publisher, "publisher")}
                          </div>
                        </motion.div>
                      </motion.div>

                      {game.images && game.images.length > 0 && (
                        <>
                          <motion.h2
                            className={`text-xl font-semibold mt-4 mb-2 ${halloweenClass}`}
                            variants={itemVariants}
                          >
                            Imágenes y Videos
                          </motion.h2>
                          <motion.div
                            className="grid grid-cols-3 gap-2 mt-2"
                            variants={containerVariants}
                          >
                            {game.images?.slice(0, 6).map((image, index) => (
                              <motion.img
                                key={index}
                                src={image.url}
                                alt={`Game screenshot ${index + 1}`}
                                className="w-full h-auto object-cover rounded cursor-pointer"
                                onClick={() => openLightbox(index)}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                              />
                            ))}
                          </motion.div>
                          {game.images?.length > 6 && (
                            <motion.button
                              onClick={() => openLightbox(0)}
                              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 w-full text-sm"
                              variants={itemVariants}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Ver todas las imágenes ({game.images.length})
                            </motion.button>
                          )}
                        </>
                      )}

                      <motion.h2
                        className={`text-xl font-semibold mb-2 mt-4 ${halloweenClass}`}
                        variants={itemVariants}
                      >
                        Reviews
                      </motion.h2>
                      <AnimatePresence>
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <motion.div
                              key={review.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                            >
                              <ReviewCard
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
                            </motion.div>
                          ))
                        ) : (
                          <motion.p
                            className="text-gray-400 text-center py-4"
                            variants={itemVariants}
                          >
                            No reviews yet,{" "}
                            <span
                              onClick={handleAddReviewClick}
                              className="text-blue-400 hover:underline cursor-pointer"
                            >
                              you can add one by clicking here
                            </span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </motion.div>
                {isLightboxOpen && game.images && game.images.length > 0 && (
                  <Lightbox
                    open={isLightboxOpen}
                    close={() => setIsLightboxOpen(false)}
                    slides={game.images.map((img) => ({ src: img.url }))}
                    index={lightboxIndex}
                  />
                )}
              </motion.div>
            ) : (
              // Diseño original
              <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8 pb-10">
                  {/* Columna izquierda */}
                  <div className="lg:w-1/3">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="sticky top-24"
                    >
                      <ImageVideoPlayer
                        key={game.id}
                        imageUrl={game.coverImageUrl}
                        videoUrl={game.videos?.[0]?.url}
                        onDoubleClick={handleVideoDoubleClick}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        gameName={game.name}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleLikeClick}
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        Release date: {formatReleaseDate(game.releaseDate)}
                      </p>
                      <button
                        onClick={handleAddReviewClick}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2 transition duration-300 w-full"
                      >
                        Add a review
                      </button>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <button
                          onClick={() => handleAddToLibrary("playing")}
                          className={`flex flex-col items-center justify-center p-2 rounded ${
                            libraryStatus === "playing"
                              ? `bg-blue-500 hover:bg-blue-600`
                              : `bg-gray-700 hover:bg-gray-600`
                          } transition duration-300`}
                        >
                          <FaPlayCircle className="text-2xl mb-1" />
                          <span>Playing</span>
                        </button>
                        <button
                          onClick={() => handleAddToLibrary("completed")}
                          className={`flex flex-col items-center justify-center p-2 rounded ${
                            libraryStatus === "completed"
                              ? `bg-green-500 hover:bg-green-600`
                              : `bg-gray-700 hover:bg-gray-600`
                          } transition duration-300`}
                        >
                          <FaCheckCircle className="text-2xl mb-1" />
                          <span>Completed</span>
                        </button>
                        <button
                          onClick={() => handleAddToLibrary("toPlay")}
                          className={`flex flex-col items-center justify-center p-2 rounded ${
                            libraryStatus === "toPlay"
                              ? `bg-yellow-500 hover:bg-yellow-600`
                              : `bg-gray-700 hover:bg-gray-600`
                          } transition duration-300`}
                        >
                          <FaListUl className="text-2xl mb-1" />
                          <span>To play</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
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
                                case "nintendoswitch":
                                  Icon = SiNintendoswitch;
                                  storeName = "Nintendo Switch";
                                  break;
                                case "epicgames":
                                  Icon = FaDesktop;
                                  storeName = "Epic Games";
                                  break;
                                case "gog":
                                  Icon = SiGogdotcom;
                                  storeName = "GOG";
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
                                  className="bg-slate-800 hover:bg-gray-700 transition duration-300 text-white px-4 py-2 rounded flex items-center justify-center"
                                >
                                  <Icon className="mr-2" /> {storeName}
                                </a>
                              );
                            })}
                      </div>
                      {(game.images && game.images.length > 0) ||
                      (game.videos && game.videos.length > 0) ? (
                        <div className="mt-4 bg-slate-800 p-4 rounded-lg">
                          <h2
                            className={`text-xl font-bold mb-2 ${halloweenClass}`}
                          >
                            Game Details
                          </h2>
                          <div className="text-sm">
                            <h3 className={`font-semibold ${halloweenClass}`}>
                              Description
                            </h3>
                            {renderDescription(game.description)}
                          </div>
                          <div className="mt-2">
                            <h3 className={`font-semibold ${halloweenClass}`}>
                              Platforms
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {game.platforms &&
                                game.platforms.map((platform) =>
                                  renderFilterableItem(platform, "platform")
                                )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h3 className={`font-semibold ${halloweenClass}`}>
                              Genres
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {game.genres &&
                                game.genres.map((genre) =>
                                  renderFilterableItem(genre, "genre")
                                )}
                            </div>
                          </div>
                          <div className="mt-2">
                            <h3 className={`font-semibold ${halloweenClass}`}>
                              Developer
                            </h3>
                            <p>
                              {renderFilterableItem(
                                game.developer,
                                "developer"
                              )}
                            </p>
                          </div>
                          <div className="mt-2">
                            <h3 className={`font-semibold ${halloweenClass}`}>
                              Publisher
                            </h3>
                            <p>
                              {renderFilterableItem(
                                game.publisher,
                                "publisher"
                              )}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  </div>

                  {/* Columna derecha */}
                  <div className="lg:w-2/3">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {(game.images && game.images.length > 0) ||
                      (game.videos && game.videos.length > 0) ? (
                        <>
                          <h2
                            className={`text-2xl font-bold mb-4 ${halloweenClass}`}
                          >
                            Images and Videos
                          </h2>
                          <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={10}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{
                              delay: 5000,
                              disableOnInteraction: false,
                            }}
                            className="mb-8"
                          >
                            {game.images?.map((image, index) => (
                              <SwiperSlide key={`image-${index}`}>
                                <img
                                  src={image.url}
                                  alt={`Game screenshot ${index + 1}`}
                                  className="w-full h-auto object-cover rounded-lg"
                                />
                              </SwiperSlide>
                            ))}
                            {game.videos?.map((video, index) => (
                              <SwiperSlide key={`video-${index}`}>
                                <div className="relative pt-[56.25%]">
                                  <YouTube
                                    videoId={getYouTubeVideoId(video.url)}
                                    opts={{
                                      width: "100%",
                                      height: "100%",
                                      playerVars: {
                                        autoplay: 0,
                                        controls: 1,
                                        modestbranding: 1,
                                        rel: 0,
                                        showinfo: 0,
                                      },
                                    }}
                                    className="absolute top-0 left-0 w-full h-full"
                                  />
                                </div>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </>
                      ) : (
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                          <h2
                            className={`text-2xl font-bold mb-4 ${halloweenClass}`}
                          >
                            Game Details
                          </h2>
                          <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">
                              Description
                            </h3>
                            <p className="text-gray-300">
                              {game.description}
                              {game.description.length > 150 && (
                                <span
                                  className="text-blue-400 cursor-pointer ml-2"
                                  onClick={toggleDescription}
                                >
                                  {showFullDescription
                                    ? "Read Less"
                                    : "Read More"}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Platforms
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {game.platforms &&
                                  game.platforms.map((platform) =>
                                    renderFilterableItem(platform, "platform")
                                  )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Genres
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {game.genres &&
                                  game.genres.map((genre) =>
                                    renderFilterableItem(genre, "genre")
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-6 mt-6">
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Developer
                              </h4>
                              <span>
                                {renderFilterableItem(
                                  game.developer,
                                  "developer"
                                )}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-2">
                                Publisher
                              </h4>
                              <p>
                                {renderFilterableItem(
                                  game.publisher,
                                  "publisher"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <h2
                        className={`text-2xl font-bold mb-4 ${halloweenClass}`}
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
                          No reviews yet,{" "}
                          <span
                            onClick={handleAddReviewClick}
                            className="text-blue-400 hover:underline cursor-pointer"
                          >
                            you can add one by clicking here
                          </span>
                        </p>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            )
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

        {fullscreenVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
              <YouTube
                videoId={getYouTubeVideoId(fullscreenVideo)}
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: {
                    autoplay: 1,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                  },
                }}
                className="w-full h-full"
              />
              <button
                onClick={closeFullscreenVideo}
                className="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <ToastContainer position="bottom-right" theme="dark" />
      </motion.div>
    </div>
  );
}
