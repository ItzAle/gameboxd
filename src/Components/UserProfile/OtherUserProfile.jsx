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
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import ProfilePicture from "./ProfilePicture";
import Bio from "./Bio";
import LikedGames from "./LikedGames";
import Reviews from "./Reviews";
import TransparentNavbar from "../Navbar/TransparentNavbar";

export default function OtherUserProfile({ userId }) {
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const router = useRouter();

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
  }, [userId, router]);

  if (!userProfile) {
    return <p className="text-white">Cargando perfil...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 space-y-8 relative z-10">
        <TransparentNavbar />
        <h1 className="text-4xl font-bold text-center mb-8">
          Perfil de {userProfile.username || "Usuario"}
        </h1>

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
