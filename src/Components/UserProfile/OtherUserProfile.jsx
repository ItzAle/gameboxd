"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import ProfilePicture from "./ProfilePicture";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserPlus,
  FaUserMinus,
  FaMapMarkerAlt,
  FaUserAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import { getUsernameStyle } from "../../utils/usernameStyles";
import OtherUserStats from "./OtherUserStats";
import OtherUserOverviewTab from "./OtherUserOverviewTab";
import LibraryTab from "./LibraryTab";
import ReviewsTab from "./ReviewsTab";
import CollectionsTab from "./CollectionsTab";
import FollowingTab from "./FollowingTab";
import FollowersTab from "./FollowersTab";

export default function OtherUserProfile({ userId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [gameDetails, setGameDetails] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const tabsRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Fetched user data:", userData); // Para depuración
          setUserProfile({
            ...userData,
            id: userId,
            library: userData.library || [],
            favoriteGames: userData.favoriteGames || [],
            reviewsCount: userData.reviewsCount || 0,
            collectionsCount: userData.collectionsCount || 0,
          });

          // Obtener el recuento de reseñas
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("userId", "==", userId)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsCount = reviewsSnapshot.size;

          // Obtener el recuento de colecciones
          const collectionsQuery = query(
            collection(db, "collections"),
            where("userId", "==", userId)
          );
          const collectionsSnapshot = await getDocs(collectionsQuery);
          const collectionsCount = collectionsSnapshot.size;

          setUserProfile({
            ...userData,
            id: userId,
            library: userData.library || [],
            favoriteGames: userData.favoriteGames || [],
            reviewsCount: reviewsCount,
            collectionsCount: collectionsCount,
          });

          console.log("Fetched user profile:", {
            ...userData,
            id: userId,
            library: userData.library || [],
            favoriteGames: userData.favoriteGames || [],
            reviewsCount: reviewsCount,
            collectionsCount: collectionsCount,
          });
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const checkFollowStatus = async () => {
      if (user) {
        const currentUserRef = doc(db, "users", user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const following = currentUserDoc.data().following || [];
        setIsFollowing(following.includes(userId));
      }
    };

    fetchUserProfile();
    checkFollowStatus();
  }, [userId, user]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para seguir a otros usuarios.");
      return;
    }

    const currentUserRef = doc(db, "users", user.uid);
    const targetUserRef = doc(db, "users", userId);

    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.uid),
        });
        setFollowersCount((prev) => prev - 1);
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(user.uid),
        });
        setFollowersCount((prev) => prev + 1);
      }
      setIsFollowing(!isFollowing);
      toast.success(
        isFollowing ? "Usuario dejado de seguir" : "Usuario seguido"
      );
    } catch (error) {
      console.error("Error al actualizar el estado de seguimiento:", error);
      toast.error("Ocurrió un error al actualizar el estado de seguimiento");
    }
  };

  const renderUsername = () => {
    if (!userProfile) return null;
    const style = getUsernameStyle(
      userProfile.nameEffect,
      userProfile.nameColor,
      userProfile.effectIntensity
    );

    return (
      <div className="flex items-center">
        <StyledUsername
          user={{ id: userId, username: userProfile.username || "Usuario" }}
          style={style}
          isPro={userProfile.isPro}
        />
        {userProfile.isPro && <ProBadge className="ml-2" />}
      </div>
    );
  };

  if (!userProfile) {
    return (
      <p className="bg-gradient-to-b from-gray-900 to-black flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
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
            {user && user.uid !== userId && (
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 rounded-full flex items-center ${
                  isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isFollowing ? (
                  <>
                    <FaUserMinus className="mr-2" /> Unfollow
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" /> Follow
                  </>
                )}
              </button>
            )}
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
          {activeTab === "overview" && userProfile && (
            <OtherUserOverviewTab userProfile={userProfile} />
          )}
          {activeTab === "library" && (
            <LibraryTab
              userProfile={userProfile}
              userId={userId}
              updateUserProfile={() => {}}
              isOwnProfile={false}
            />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab userProfile={userProfile} isOwnProfile={false} />
          )}
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
