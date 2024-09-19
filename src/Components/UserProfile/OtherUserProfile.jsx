"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import Bio from "./Bio";
import LikedGames from "./LikedGames";
import Reviews from "./Reviews";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { useAuth } from "../../context/AuthContext";
import {
  FaUserPlus,
  FaUserMinus,
  FaGamepad,
  FaStar,
  FaUserFriends,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";
import ProBadge from "../common/ProBadge";
import StyledUsername from "../common/StyledUsername";
import { getUsernameStyle } from "../../utils/usernameStyles";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";

export default function OtherUserProfile({ userId }) {
  const [userProfile, setUserProfile] = useState(null);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [gameDetails, setGameDetails] = useState({});
  const [userReviews, setUserReviews] = useState([]);
  const router = useRouter();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          setFavoriteGames(userData.likedGames || []);
          if (userData.likedGames && userData.likedGames.length > 0) {
            fetchGameDetails(userData.likedGames);
          }

          const reviewsQuery = query(
            collection(db, "reviews"),
            where("userId", "==", userId)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserReviews(reviewsData);
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();

    const checkFollowStatus = async () => {
      if (user) {
        const currentUserRef = doc(db, "users", user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const following = currentUserDoc.data().following || [];
        setIsFollowing(following.includes(userId));
      }
    };

    checkFollowStatus();
  }, [userId, user, router]);

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
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(user.uid),
        });
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

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (userProfile && userProfile.likedGames) {
        const details = { ...gameDetails };
        for (const game of userProfile.likedGames) {
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

  const memoizedGameDetails = useMemo(() => gameDetails, [gameDetails]);

  const renderUsername = () => {
    const style = getUsernameStyle(
      userProfile.nameEffect,
      userProfile.nameColor,
      userProfile.effectIntensity
    );

    return (
      <StyledUsername
        user={{ id: userId, username: userProfile.username || "Usuario" }}
        style={style}
        isPro={userProfile.isPro}
      />
    );
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-blue-500 text-2xl">
          <Loader />
        </p>
      </div>
    );
  }

  const ProfileSection = ({ children }) => (
    <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <StarField count={200} />
      <div className="container mx-auto p-4 space-y-8 relative z-10">
        <TransparentNavbar />
        {user && !user.isPro && <UpgradeBanner />}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0 flex items-center">
            {renderUsername()}
          </h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ProfileSection>
              <ProfilePicture profilePicture={userProfile.profilePicture} />
              <Bio bio={userProfile.bio} />
            </ProfileSection>
            <ProfileSection>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaUserFriends className="mr-2 text-blue-400" /> Followers
              </h2>
              <p>{userProfile.followers?.length || 0} followers</p>
            </ProfileSection>

            <ProfileSection>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaGamepad className="mr-2 text-green-400" /> Favorite Games
              </h2>
              <LikedGames
                userEmail={userProfile.email}
                favoriteGames={favoriteGames}
                isOwnProfile={false}
                gameDetails={memoizedGameDetails}
              />
            </ProfileSection>
          </div>

          <div className="md:col-span-2">
            <ProfileSection>
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaStar className="mr-2 text-yellow-400" /> Reviews
              </h2>
              {userReviews.length > 0 ? (
                <Reviews reviews={userReviews} isOwnProfile={false} />
              ) : (
                <p className="text-lg text-gray-400">
                  This user has no reviews yet.
                </p>
              )}
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}
