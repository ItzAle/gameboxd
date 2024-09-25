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
  FaCog,
} from "react-icons/fa";
import { Loader } from "lucide-react";
import ProBadge from "../common/ProBadge";
import ProOptionsModal from "../ProOptionsModal/ProOptionsModal";
import StyledUsername from "../common/StyledUsername";
import { getUsernameStyle } from "../../utils/usernameStyles";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";
import OverviewTab from "./OverviewTab";
import LibraryTab from "./LibraryTab";
import ReviewsTab from "./ReviewsTab";
import CollectionsTab from "./CollectionsTab";
import FollowingTab from "./FollowingTab";
import FollowersTab from "./FollowersTab";

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
  const [activeTab, setActiveTab] = useState("overview");
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
  const [nameEffect, setNameEffect] = useState("");
  const [nameColor, setNameColor] = useState("");
  const [effectIntensity, setEffectIntensity] = useState(1);
  const [showProOptions, setShowProOptions] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setNameEffect(userData.nameEffect || "");
        setNameColor(userData.nameColor || "");
        setEffectIntensity(userData.effectIntensity || 1);
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
  }, [user]);

  const fetchUserReviews = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserReviews();
  }, [fetchUserProfile, fetchUserReviews]);

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

  const handleProOptionsUpdate = async (newOptions) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        nameEffect: newOptions.nameEffect,
        nameColor: newOptions.nameColor,
        effectIntensity: newOptions.effectIntensity,
      });

      // Actualizar el estado local
      setNameEffect(newOptions.nameEffect);
      setNameColor(newOptions.nameColor);
      setEffectIntensity(newOptions.effectIntensity);
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        nameEffect: newOptions.nameEffect,
        nameColor: newOptions.nameColor,
        effectIntensity: newOptions.effectIntensity,
      }));

      toast.success("Opciones PRO actualizadas con éxito");
    } catch (error) {
      console.error("Error al actualizar las opciones PRO:", error);
      toast.error("Error al actualizar las opciones PRO");
    }
  };

  const renderUsername = () => {
    const style = getUsernameStyle(nameEffect, nameColor, effectIntensity);

    return (
      <StyledUsername
        user={{
          id: user.uid,
          username: userProfile?.username || user?.displayName || "User",
        }}
        style={style}
        isPro={userProfile?.isPro}
      />
    );
  };

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
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <TransparentNavbar />
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ProfilePicture
              profilePicture={userProfile.profilePicture}
              size="large"
            />
            <h1 className="text-4xl font-bold ml-4">{userProfile.username}</h1>
          </div>
          <Link href="/profile/settings">
            <button className="bg-gray-700 p-2 rounded-full">
              <FaCog className="text-xl" />
            </button>
          </Link>
        </header>
        <nav className="mb-8">
          <ul className="flex border-b border-gray-700">
            {[
              "Overview",
              "Library",
              "Reviews",
              "Collections",
              "Following",
              "Followers",
            ].map((tab) => (
              <li key={tab} className="mr-2">
                <button
                  className={`py-2 px-4 ${
                    activeTab === tab.toLowerCase()
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main>
          {activeTab === "overview" && (
            <OverviewTab userProfile={userProfile} />
          )}
          {activeTab === "library" && <LibraryTab userProfile={userProfile} />}
          {activeTab === "reviews" && <ReviewsTab userProfile={userProfile} />}
          {activeTab === "collections" && (
            <CollectionsTab userProfile={userProfile} />
          )}
          {activeTab === "following" && (
            <FollowingTab userProfile={userProfile} />
          )}
          {activeTab === "followers" && (
            <FollowersTab userProfile={userProfile} />
          )}
        </main>
      </div>
    </div>
  );
}
