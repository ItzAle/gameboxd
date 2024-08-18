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

        // Fetch user's reviews
        const reviewsRef = collection(db, "reviews");
        const reviewsQuery = query(
          reviewsRef,
          where("user", "==", decodedUsername)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);

        if (reviewsSnapshot.empty) {
          throw new Error("User not found");
        }

        const userReviews = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("User reviews:", userReviews);
        setReviews(userReviews);

        // Construct user profile from reviews
        const likedGames = userReviews
          .filter((review) => review.liked)
          .map((review) => ({
            gameId: review.gameId,
            gameName: review.gameName,
            gameCover: review.gameCover,
          }));

        setUserProfile({
          name: decodedUsername,
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{userProfile.name}'s Profile</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Liked Games</h2>
        {userProfile.likedGames && userProfile.likedGames.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userProfile.likedGames.map((game) => (
              <li key={game.gameId}>
                <Link href={`/games/${game.gameId}`}>
                  <div className="border p-2 rounded hover:shadow-lg transition">
                    {game.gameCover && (
                      <img
                        src={game.gameCover}
                        alt={game.gameName}
                        className="w-full h-32 object-cover mb-2"
                      />
                    )}
                    <p className="text-center font-medium">{game.gameName}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No liked games yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border p-4 rounded shadow">
                <Link href={`/games/${review.gameId}`}>
                  <h3 className="text-xl font-semibold mb-2 hover:underline">
                    {review.gameName}
                  </h3>
                </Link>
                <p className="text-yellow-500 mb-2">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
                <p>{review.comment}</p>
                {review.containsSpoilers && (
                  <p className="text-red-500 mt-2">Contains Spoilers</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
