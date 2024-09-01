import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Modal from "../Modal/Modal";
import Bio from "./Bio";
import LikedGames from "./LikedGames";
import ProfilePicture from "./ProfilePicture";
import Reviews from "./Reviews";
import { toast } from "react-toastify";
import { useReviews } from "../../context/ReviewsProvider";
import Navbar from "../Navbar/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaStar } from "react-icons/fa";
import jsonp from "jsonp";

const StarField = ({ count = 100 }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className="fixed inset-0 z-0">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x * 100}%`,
            top: `${star.y * 100}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function UserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [covers, setCovers] = useState({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const { reviews, updateReview, deleteReview } = useReviews();
  const user = session?.user;
  const apiUrl = "https://www.giantbomb.com/api/games/";

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchGameById = (gameId) => {
    return new Promise((resolve, reject) => {
      const params = {
        api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
        format: "jsonp",
        json_callback: "jsonpCallback",
        filter: `id:${gameId}`,
      };

      const urlParams = new URLSearchParams(params).toString();
      const apiUrlWithParams = `${apiUrl}?${urlParams}`;

      jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
        if (err) {
          console.error("Error fetching game data:", err);
          reject(err);
        } else {
          resolve(data.results[0]);
        }
      });
    });
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setBio(userData.bio || "");
        setProfilePicture(userData.profilePicture || "");

        // Obtener las carátulas de los juegos
        const newCovers = {};
        for (const game of userData.likedGames) {
          if (game.gameId) {
            try {
              const gameData = await fetchGameById(game.gameId);
              newCovers[game.gameId] = gameData.image.medium_url;
            } catch (error) {
              console.error(
                `Error fetching cover for game ${game.gameId}:`,
                error
              );
            }
          }
        }
        setCovers(newCovers);
      } else {
        setUserProfile({ likedGames: [], reviews: [] });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.email);
      await updateDoc(userRef, {
        bio,
        profilePicture,
      });

      // Actualizar el userProfile local después de guardar
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        bio,
        profilePicture,
      }));

      setEditing(false);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setBio(userProfile.bio || "");
      setProfilePicture(userProfile.profilePicture || "");
    }
    setEditing(true);
  };

  const onEditReview = async (reviewId, newComment, newRating) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await updateDoc(reviewRef, {
        comment: newComment,
        rating: newRating,
      });

      updateReview(reviewId, { comment: newComment, rating: newRating });

      toast.success("Reseña actualizada con éxito");
      return true;
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Error al actualizar la reseña");
      return false;
    }
  };

  const onDeleteReview = async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await deleteDoc(reviewRef);

      deleteReview(reviewId);

      toast.success("Reseña eliminada con éxito");
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Error al eliminar la reseña");
      return false;
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
      >
        <p className="text-red-500 mb-4">Please log in to view your profile.</p>
        <Link
          href="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
        >
          Login here
        </Link>
      </motion.div>
    );
  }

  if (!userProfile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen bg-gray-900 text-white"
      >
        <motion.p
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-blue-500 text-2xl"
        >
          Loading profile...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <StarField count={200} />
        <div className="container mx-auto p-4 space-y-8 relative z-10">
          <Navbar />
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-center mb-8"
          >
            Welcome, {user.name}!
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-1"
            >
              <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
                <ProfilePicture profilePicture={profilePicture} />
                <Bio bio={bio} setBio={setBio} editing={editing} />
                {!editing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditProfile}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full mt-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center"
                  >
                    <FaEdit className="mr-2" /> Edit Profile
                  </motion.button>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <LikedGames
                  userEmail={user.email}
                  likedGames={userProfile.likedGames}
                  covers={covers}
                />
              </motion.div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="md:col-span-2"
            >
              <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
                <h2 className="text-2xl font-semibold mb-2 flex items-center">
                  <FaStar className="mr-2 text-yellow-400" /> Your Reviews
                </h2>
                <AnimatePresence>
                  {userProfile.reviews && userProfile.reviews.length > 0 ? (
                    <Reviews
                      reviews={reviews}
                      onEditReview={onEditReview}
                      onDeleteReview={onDeleteReview}
                    />
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-lg"
                    >
                      You have not written any reviews yet.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Modal para editar perfil */}
          <AnimatePresence>
            {editing && (
              <Modal
                isOpen={editing}
                onClose={() => setEditing(false)}
                onSave={handleSaveProfile}
                setBio={setBio}
                setProfilePicture={setProfilePicture}
                bio={bio}
                profilePicture={profilePicture}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
