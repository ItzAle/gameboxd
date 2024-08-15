"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState({
    likedGames: [],
    reviews: [],
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user/${session.user.email}`)
        .then((res) => res.json())
        .then((data) => setUserProfile(data));
    }
  }, [session]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Liked Games</h2>
        <ul>
          {userProfile.likedGames.length > 0 ? (
            userProfile.likedGames.map((game) => (
              <li key={game.id} className="mb-2">
                {game.name}
              </li>
            ))
          ) : (
            <p>No liked games yet.</p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
        <ul>
          {userProfile.reviews.length > 0 ? (
            userProfile.reviews.map((review) => (
              <li
                key={review.id}
                className="mb-4 p-4 border border-gray-300 rounded bg-white"
              >
                <p className="font-bold">{review.gameName}</p>
                <p className="text-yellow-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
                <p>{review.comment}</p>
                {review.containsSpoilers && (
                  <p className="text-red-500">Contains Spoilers</p>
                )}
              </li>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
