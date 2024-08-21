"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function UserProfilePage({ params }) {
  const { username } = params;
  const [userProfile, setUserProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const decodedUsername = decodeURIComponent(username);
        console.log("Fetching profile for:", decodedUsername);

        // Fetch user's profile document
        const userRef = collection(db, "users");
        const userQuery = query(
          userRef,
          where("username", "==", decodedUsername)
        );
        const userSnapshot = await getDocs(userQuery);

        // Handle case where user is not found
        if (userSnapshot.empty) {
          throw new Error("User not found");
        }

        const userDoc = userSnapshot.docs[0].data();

        // Fetch user's reviews
        const reviewsRef = collection(db, "reviews");
        const reviewsQuery = query(
          reviewsRef,
          where("user", "==", decodedUsername)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);

        const userReviews = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("User reviews:", userReviews);
        setReviews(userReviews);

        // Construct user profile
        const likedGames = userReviews
          .filter((review) => review.liked)
          .map((review) => ({
            gameId: review.gameId,
            gameName: review.gameName,
            gameCover: review.gameCover,
          }));

        setUserProfile({
          name: userDoc.name || decodedUsername,
          bio: userDoc.bio || "No bio available.",
          profilePicture:
            userDoc.profilePicture || "/path/to/default-profile-pic.png",
          likedGames: likedGames,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center mt-8">User not found</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in">
        Profile of {userProfile.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            {/* Profile Picture */}
            <div className="mb-4 flex flex-col items-center">
              <img
                src={userProfile.profilePicture}
                alt={`${userProfile.name}'s profile picture`}
                className="w-32 h-32 object-cover rounded-full shadow-lg"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Bio</h2>
              <p className="text-lg">{userProfile.bio}</p>
            </div>
          </div>

          {/* Liked Games Section */}
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Liked Games</h2>
            {userProfile.likedGames && userProfile.likedGames.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-64">
                {userProfile.likedGames.map((game) => (
                  <li key={game.gameId} className="mb-2">
                    <Link href={`/games/${game.gameId}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                          <img
                            src={
                              game.gameCover ||
                              "/path/to/placeholder-image.png"
                            }
                            alt={game.gameName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-center font-medium">
                            {game.gameName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg">No liked games yet.</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="md:col-span-2">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="p-4 border border-gray-300 rounded bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link href={`/games/${review.gameId}`}>
                      <p className="text-xl font-bold hover:underline">
                        {review.gameName}
                      </p>
                    </Link>
                    <p className="text-yellow-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                    <p className="mt-2">{review.comment}</p>
                    {review.containsSpoilers && (
                      <p className="text-red-500 mt-1">Contains Spoilers</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
