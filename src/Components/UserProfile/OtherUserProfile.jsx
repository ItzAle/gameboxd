"use client";

import { useEffect, useState } from "react";
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
import { FaUserPlus, FaUserMinus } from "react-icons/fa";
import { toast } from "react-toastify";
import { Loader } from "lucide-react";

export default function OtherUserProfile({ userId }) {
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const router = useRouter();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);

          // Obtener las reseñas del usuario
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
          router.push("/404");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        router.push("/404");
      }
    };

    fetchUserProfile();

    // Verificar si el usuario actual sigue a este perfil
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

  if (!userProfile) {
    return (
      <p className="text-white">
        <Loader />
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 space-y-8 relative z-10">
        <TransparentNavbar />
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold mb-8">
            Perfil de {userProfile.username || "Usuario"}
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
                  <FaUserMinus className="mr-2" /> Dejar de seguir
                </>
              ) : (
                <>
                  <FaUserPlus className="mr-2" /> Seguir
                </>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
              <ProfilePicture profilePicture={userProfile.profilePicture} />
              <Bio bio={userProfile.bio} />
            </div>

            <LikedGames
              userEmail={userProfile.email}
              likedGames={userProfile.likedGames || []}
              isOwnProfile={false}
            />
          </div>

          <div className="md:col-span-2">
            <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
              <h2 className="text-2xl font-semibold mb-2">Reseñas</h2>
              <Reviews reviews={userReviews} isOwnProfile={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
