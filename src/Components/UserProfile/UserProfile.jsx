"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import dynamic from "next/dynamic";
import Bio from "./Bio";
import ProfilePicture from "./ProfilePicture";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useReviews } from "../../context/ReviewsProvider";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaUserFriends,
  FaCog,
  FaMapMarkerAlt,
  FaUserAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { Loader2 } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import { getUsernameStyle } from "../../utils/usernameStyles";
import { motion, AnimatePresence } from "framer-motion";

// Carga dinámica de componentes
const Modal = dynamic(() => import("../Modal/Modal"));
const LikedGames = dynamic(() => import("./LikedGames"));
const Reviews = dynamic(() => import("./Reviews"));
const FollowList = dynamic(() => import("./FollowList"));
const ProOptionsModal = dynamic(() =>
  import("../ProOptionsModal/ProOptionsModal")
);
const UpgradeBanner = dynamic(() => import("../UpgradeBaner/UpgradeBanner"));
const OverviewTab = dynamic(() => import("./OverviewTab"));
const LibraryTab = dynamic(() => import("./LibraryTab"));
const ReviewsTab = dynamic(() => import("./ReviewsTab"));
const CollectionsTab = dynamic(() => import("./CollectionsTab"));
const FollowingTab = dynamic(() => import("./FollowingTab"));
const FollowersTab = dynamic(() => import("./FollowersTab"));

const StarField = ({ count = 100 }) => {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    [count]
  );

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

const detailsVariants = {
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
  const [showProfileDetails, setShowProfileDetails] = useState(true);
  const [gameCache, setGameCache] = useState({});

  const fetchGameDetails = useCallback(
    async (slug) => {
      if (gameCache[slug]) return gameCache[slug];

      try {
        const response = await fetch(
          `https://api.gameboxd.me/api/game/${slug}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setGameCache((prev) => ({ ...prev, [slug]: data }));
          return data;
        }
      } catch (error) {
        console.error(`Error al obtener detalles del juego ${slug}:`, error);
      }
      return null;
    },
    [gameCache]
  );

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
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
            const gameData = await fetchGameDetails(game.slug);
            if (gameData) {
              newCovers[game.slug] = gameData.coverImageUrl;
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
    } catch (error) {
      console.error("Error al cargar el perfil del usuario:", error);
    }
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
    } catch (error) {
      console.error("Error al cargar las reseñas del usuario:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserProfile();
    fetchUserReviews();
  }, [fetchUserProfile, fetchUserReviews]);

  useEffect(() => {
    if (userProfile) {
      setFollowersCount(userProfile.followers?.length || 0);
      setFollowingCount(userProfile.following?.length || 0);
    }
  }, [userProfile]);

  const updateUserProfile = useCallback(async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  }, [user]);

  const memoizedGameDetails = useMemo(() => gameDetails, [gameDetails]);

  const handleSaveProfile = useCallback(async () => {
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
      toast.success("Perfil actualizado con éxito");
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    }
  }, [user, editingBio, profilePicture]);

  const handleEditProfile = useCallback(() => {
    if (userProfile) {
      setEditingBio(userProfile.bio || "");
      setProfilePicture(userProfile.profilePicture || "");
    }
    setEditing(true);
  }, [userProfile]);

  const onEditReview = useCallback(async (reviewId, newComment, newRating) => {
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

      toast.success("Reseña actualizada con éxito");
      return true;
    } catch (error) {
      toast.error("Error al actualizar la reseña");
      return false;
    }
  }, []);

  const onDeleteReview = useCallback(async (reviewId) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId);
      await deleteDoc(reviewRef);

      setUserReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );

      toast.success("Reseña eliminada con éxito");
      return true;
    } catch (error) {
      toast.error("Error al eliminar la reseña");
      return false;
    }
  }, []);

  const handleShowFollowList = useCallback((type) => {
    setFollowListType(type);
    setShowFollowList(true);
  }, []);

  const handleProOptionsUpdate = useCallback(
    async (newOptions) => {
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
    },
    [user]
  );

  const renderUsername = useCallback(() => {
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
  }, [userProfile, user, nameEffect, nameColor, effectIntensity]);

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
    return <Loader2 className="animate-spin text-white" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8 overflow-hidden">
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
      <ToastContainer />
    </div>
  );
}
