"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  FaMapMarkerAlt,
  FaUserAlt,
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
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const tabsRef = useRef(null);

  useEffect(() => {
    const tabsContainer = tabsRef.current;
    if (!tabsContainer) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - tabsContainer.offsetLeft;
      scrollLeft = tabsContainer.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - tabsContainer.offsetLeft;
      const walk = (x - startX) * 2;
      tabsContainer.scrollLeft = scrollLeft - walk;
    };

    tabsContainer.addEventListener("mousedown", handleMouseDown);
    tabsContainer.addEventListener("mouseleave", handleMouseLeave);
    tabsContainer.addEventListener("mouseup", handleMouseUp);
    tabsContainer.addEventListener("mousemove", handleMouseMove);

    return () => {
      tabsContainer.removeEventListener("mousedown", handleMouseDown);
      tabsContainer.removeEventListener("mouseleave", handleMouseLeave);
      tabsContainer.removeEventListener("mouseup", handleMouseUp);
      tabsContainer.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const fetchGameDetails = useCallback(async (slug) => {
    try {
      const response = await fetch(
        `https://gbxd-api.vercel.app/api/game/${slug}`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error(
          `Failed to fetch details for game ${slug}: ${response.status}`
        );
        return null;
      }
    } catch (error) {
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Datos del usuario cargados:", userData);
        setUserProfile({
          ...userData,
          username: userData.username || user.displayName || "Usuario",
        });
        setNameEffect(userData.nameEffect || "");
        setNameColor(userData.nameColor || "");
        setEffectIntensity(userData.effectIntensity || 1);
        setBio(userData.bio || "");
        setProfilePicture(userData.profilePicture || "");
        setFavoriteGames(userData.likedGames || []);
        setLikedGames(userData.likedGames || []);

        const newCovers = {};
        for (const game of userData.likedGames) {
          if (game && game.slug) {
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
        setUserProfile({
          username: user.displayName || "Usuario",
          likedGames: [],
          reviews: [],
        });
      }
    } catch (error) {}
  }, [user, fetchGameDetails]);

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
    } catch (error) {}
  }, [user]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserReviews();
  }, [fetchUserProfile, fetchUserReviews]);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (userProfile && userProfile.likedGames) {
        const details = { ...gameDetails };
        for (const game of userProfile.likedGames) {
          if (game && game.slug && !details[game.slug]) {
            try {
              const response = await fetch(
                `https://gbxd-api.vercel.app/api/game/${game.slug}`
              );
              if (response.ok) {
                const data = await response.json();
                details[game.slug] = data;
              } else {
                console.error(
                  `Failed to fetch details for game ${game.slug}: ${response.status}`
                );
              }
            } catch (error) {
              console.error(
                `Error fetching details for game ${game.slug}:`,
                error
              );
            }
          }
        }
        setGameDetails(details);
      }
    };

    fetchGameDetails();
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      setFollowersCount(userProfile.followers?.length || 0);
      setFollowingCount(userProfile.following?.length || 0);
    }
  }, [userProfile]);

  const updateUserProfile = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  };

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
      toast.error("Error al actualizar las opciones PRO");
    }
  };

  const renderUsername = () => {
    const style = getUsernameStyle(nameEffect, nameColor, effectIntensity);
    const displayName = userProfile?.username || user?.displayName || "Usuario";

    return (
      <div className="flex items-center">
        <StyledUsername
          user={{
            id: user?.uid,
            username: displayName,
          }}
          style={style}
          isPro={userProfile?.isPro}
        />
        {userProfile?.isPro && <ProBadge className="ml-2" />}
      </div>
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
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <TransparentNavbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ProfilePicture
                profilePicture={userProfile.profilePicture}
                size="large"
              />
              <div className="ml-4">
                <h1 className="text-4xl font-bold">{renderUsername()}</h1>
                <div className="mt-2 text-gray-400 flex items-center flex-wrap">
                  {userProfile.pronouns && (
                    <span className="mr-4 flex items-center">
                      <FaUserAlt className="mr-1" />
                      {userProfile.pronouns}
                    </span>
                  )}
                  {userProfile.location && (
                    <span className="mr-4 flex items-center">
                      <FaMapMarkerAlt className="mr-1" />
                      {userProfile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link href="/settings">
              <button className="bg-gray-700 p-2 rounded-full">
                <FaCog className="text-xl" />
              </button>
            </Link>
          </div>
          {userProfile.bio && (
            <p className="mt-4 text-gray-300 max-w-2xl">{userProfile.bio}</p>
          )}
        </header>
        <nav className="mb-8 overflow-x-auto" ref={tabsRef}>
          <ul className="flex border-b border-gray-700 whitespace-nowrap">
            {[
              "Overview",
              "Library",
              "Reviews",
              "Collections",
              { name: "Following", count: followingCount },
              { name: "Followers", count: followersCount },
            ].map((tab) => (
              <li
                key={typeof tab === "string" ? tab : tab.name}
                className="mr-2 flex-shrink-0"
              >
                <button
                  className={`py-2 px-4 ${
                    activeTab ===
                    (typeof tab === "string"
                      ? tab.toLowerCase()
                      : tab.name.toLowerCase())
                      ? "border-b-2 border-blue-500"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveTab(
                      typeof tab === "string"
                        ? tab.toLowerCase()
                        : tab.name.toLowerCase()
                    )
                  }
                >
                  {typeof tab === "string" ? (
                    tab
                  ) : (
                    <>
                      {tab.name}
                      {tab.count > 0 && (
                        <span className="ml-1 text-xs align-super">
                          ({tab.count})
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main>
          {activeTab === "overview" && (
            <OverviewTab userProfile={userProfile} />
          )}
          {activeTab === "library" && (
            <LibraryTab
              userProfile={userProfile}
              userId={user.uid}
              updateUserProfile={updateUserProfile}
            />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab userProfile={{ id: user.uid }} isOwnProfile={true} />
          )}
          {activeTab === "collections" && <CollectionsTab userProfile={user} />}
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
