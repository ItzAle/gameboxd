import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Modal from "../Modal/Modal"; // Importa el componente Modal
import Bio from "./Bio"; // Importa el componente Bio
import LikedGames from "./LikedGames"; // Importa el componente LikedGames
import ProfilePicture from "./ProfilePicture"; // Importa el componente ProfilePicture
import Reviews from "./Reviews"; // Importa el componente Reviews
import { toast } from "react-toastify";
import { useReviews } from "../../context/ReviewsProvider";

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
    return <p className="text-red-500">Please log in to view your profile.</p>;
  }

  if (!userProfile) {
    return <p className="text-blue-500">Loading profile...</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in">
        Welcome, {user.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <ProfilePicture profilePicture={profilePicture} />
            <Bio bio={bio} setBio={setBio} editing={editing} />
            {!editing && (
              <button
                onClick={handleEditProfile}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
              >
                Edit Profile
              </button>
            )}
          </div>

          <LikedGames likedGames={userProfile.likedGames} covers={covers} />
        </div>

        {/* Reviews Section */}
        <div className="md:col-span-2">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Your Reviews</h2>
            {userProfile.reviews && userProfile.reviews.length > 0 ? (
              <Reviews
                reviews={reviews}
                onEditReview={onEditReview}
                onDeleteReview={onDeleteReview}
              />
            ) : (
              <p className="text-lg">You have not written any reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal para editar perfil */}
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
    </div>
  );
}
