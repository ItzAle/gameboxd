"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Modal from "../Modal/Modal";
import Bio from "./Bio";
import LikedGames from "./LikedGames";
import ProfilePicture from "./ProfilePicture";
import Reviews from "./Reviews";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useReviews } from "../../context/ReviewsProvider";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import FollowList from "./FollowList";
import {
  FaEdit,
  FaStar,
  FaUserFriends,
  FaGamepad,
  FaPen,
} from "react-icons/fa";
import { Loader } from "lucide-react";

const StarField = ({ count = 100 }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className="fixed inset-0 z-0">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x * 100}%`,
            top: `${star.y * 100}%`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default function UserProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [covers, setCovers] = useState({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const { reviews, updateReview, deleteReview } = useReviews();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState("followers");
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [likedGames, setLikedGames] = useState([]);
  const [gameDetails, setGameDetails] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserReviews();
    }
  }, [user]);

  const fetchGameDetails = async (games) => {
    const details = { ...gameDetails };
    for (const game of games) {
      if (!details[game.slug]) {
        try {
          const response = await fetch(
            `https://gbxd-api.vercel.app/api/game/${game.slug}`
          );
          if (response.ok) {
            const data = await response.json();
            details[game.slug] = data;
          }
        } catch (error) {
          console.error(`Error fetching details for game ${game.slug}:`, error);
        }
      }
    }
    setGameDetails(details);
  };

  useEffect(() => {
    if (likedGames.length > 0) {
      fetchGameDetails(likedGames);
    }
  }, [likedGames]);

  const memoizedGameDetails = useMemo(() => gameDetails, [gameDetails]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          ...userData,
          followers: userData.followers || [],
          following: userData.following || [],
        });
        setBio(userData.bio || "");
        setProfilePicture(userData.profilePicture || "");
        setFavoriteGames(userData.likedGames || []);
        setLikedGames(userData.likedGames || []);

        const newCovers = {};
        for (const game of userData.likedGames) {
          if (game.slug) {
            try {
              const gameData = await fetchGameDetails(game.slug);
              if (gameData) {
                newCovers[game.slug] = gameData.coverImageUrl;
              }
            } catch (error) {
              console.error(
                `Error al obtener la carátula del juego ${game.slug}:`,
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
      console.error("Error al obtener el perfil del usuario:", error);
    }
  };

  const fetchUserReviews = async () => {
    if (!user) return;

    try {
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("userId", "==", user.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bio: editingBio,
        profilePicture,
      });

      setUserProfile((prevProfile) => ({
        ...prevProfile,
        bio: editingBio,
        profilePicture,
      }));
      setBio(editingBio);

      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setEditingBio(userProfile.bio || "");
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

      setUserReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? { ...review, comment: newComment, rating: newRating }
            : review
        )
      );

      toast.success("Review updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
      return false;
    }
  };

  const onDeleteReview = async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await deleteDoc(reviewRef);

      setUserReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );

      toast.success("Review deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
      return false;
    }
  };

  const handleShowFollowList = useCallback((type) => {
    setFollowListType(type);
    setShowFollowList(true);
  }, []);

  const memoizedLikedGames = useMemo(
    () => (
      <LikedGames
        userEmail={user.email}
        favoriteGames={favoriteGames}
        setUserProfile={setUserProfile}
        isOwnProfile={true}
        gameDetails={memoizedGameDetails}
      />
    ),
    [user.email, favoriteGames, setUserProfile, memoizedGameDetails]
  );

  if (!user) {
    router.push("/signin");
    return null;
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-blue-500 text-2xl">
          {" "}
          <Loader />{" "}
        </p>
      </div>
    );
  }

  const ProfileSection = ({ children }) => (
    <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
      {children}
    </div>
  );

  const MobileProfile = () => (
    <div className="space-y-6">
      <ProfileSection>
        <div className="flex items-center space-x-4">
          <div className="w-24 h-24 rounded-full overflow-hidden">
            <ProfilePicture profilePicture={profilePicture} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {userProfile?.username || user?.displayName || "User"}
            </h1>
            {!editing && (
              <button
                onClick={handleEditProfile}
                className="bg-blue-500 text-white px-3 py-1 rounded-full mt-2 text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center"
              >
                <FaEdit className="mr-1" /> Edit Profile
              </button>
            )}
          </div>
        </div>
        <Bio bio={bio} setBio={setBio} editing={editing} />
      </ProfileSection>

      <ProfileSection>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaGamepad className="mr-2 text-green-400" /> Favorite Games
        </h2>
        {memoizedLikedGames}
      </ProfileSection>

      <ProfileSection>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaStar className="mr-2 text-yellow-400" /> Your Reviews
        </h2>
        {userReviews.length > 0 ? (
          <Reviews
            reviews={userReviews}
            onEditReview={onEditReview}
            onDeleteReview={onDeleteReview}
            isOwnProfile={true}
          />
        ) : (
          <p className="text-lg text-gray-400">You have no reviews yet.</p>
        )}
      </ProfileSection>
    </div>
  );

  const DesktopProfile = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <ProfileSection>
          <ProfilePicture profilePicture={profilePicture} />
          <Bio bio={bio} setBio={setBio} editing={editing} />
          {!editing && (
            <button
              onClick={handleEditProfile}
              className="bg-blue-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 flex items-center justify-center w-full"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          )}
        </ProfileSection>

        <ProfileSection>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaGamepad className="mr-2 text-green-400" /> Favorite Games
          </h2>
          {memoizedLikedGames}
        </ProfileSection>
      </div>

      <div className="md:col-span-2">
        <ProfileSection>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaStar className="mr-2 text-yellow-400" /> Your Reviews
          </h2>
          {userReviews.length > 0 ? (
            <Reviews
              reviews={userReviews}
              onEditReview={onEditReview}
              onDeleteReview={onDeleteReview}
              isOwnProfile={true}
            />
          ) : (
            <p className="text-lg text-gray-400">You have no reviews yet.</p>
          )}
        </ProfileSection>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
        <StarField count={200} />
        <div className="container mx-auto p-4 space-y-8 relative z-10">
          <TransparentNavbar />
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-4xl font-bold mb-4 md:mb-0">
              {userProfile?.username || user?.displayName || "User"}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => handleShowFollowList("followers")}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
              >
                <FaUserFriends className="mr-2 inline" />
                Followers ({userProfile.followers.length})
              </button>
              <button
                onClick={() => handleShowFollowList("following")}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
              >
                <FaUserFriends className="mr-2 inline" />
                Following ({userProfile.following.length})
              </button>
            </div>
          </div>

          {isMobile ? <MobileProfile /> : <DesktopProfile />}

          {editing && (
            <Modal
              isOpen={editing}
              onClose={() => setEditing(false)}
              onSave={handleSaveProfile}
              setBio={setEditingBio}
              setProfilePicture={setProfilePicture}
              bio={editingBio}
              profilePicture={profilePicture}
            />
          )}
        </div>
      </div>
      {showFollowList && (
        <FollowList
          type={followListType}
          users={
            followListType === "followers"
              ? userProfile.followers
              : userProfile.following
          }
          onClose={() => setShowFollowList(false)}
        />
      )}
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}
