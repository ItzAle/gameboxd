"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import jsonp from "jsonp";

export default function UserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [covers, setCovers] = useState({});
  const user = session?.user;
  const apiUrl = "https://www.giantbomb.com/api/games/";

  const fetchGameById = (gameId) => {
    return new Promise((resolve, reject) => {
      const params = {
        api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
        format: "jsonp",
        json_callback: "jsonpCallback",
        filter: `id:${gameId}`,
      };

      const urlParams = new URLSearchParams(params).toString();
      const apiUrlWithParams = `${apiUrl}?${urlParams}`;

      jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
        if (err) {
          console.error("Error fetching game data:", err);
          reject(err);
        } else {
          resolve(data.results[0]);
        }
      });
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);

          // Obtener las carátulas de los juegos
          const newCovers = {};
          for (const game of userData.likedGames) {
            if (game.gameId) {
              try {
                const gameData = await fetchGameById(game.gameId);
                newCovers[game.gameId] = gameData.image.medium_url;
              } catch (error) {
                console.error(
                  `Error fetching cover for game ${game.gameId}:`,
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
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  if (!userProfile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>

      {/* Liked Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Liked Games</h2>
        {userProfile.likedGames && userProfile.likedGames.length > 0 ? (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userProfile.likedGames.map((game) => (
              <li key={game.gameId} className="mb-2">
                <Link href={`/games/${game.gameId}`}>
                  <img
                    src={
                      covers[game.gameId] || "/path/to/placeholder-image.png"
                    }
                    alt={game.gameName}
                    className="w-full h-48 object-cover rounded-md shadow-md"
                  />
                  <p className="mt-2 text-center font-medium">
                    {game.gameName}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not liked any games yet.</p>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Your Reviews</h2>
        {userProfile.reviews && userProfile.reviews.length > 0 ? (
          <ul>
            {userProfile.reviews.map((review) => (
              <li
                key={review.gameId}
                className="mb-4 p-4 border border-gray-300 rounded bg-white"
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
          <p>You have not written any reviews yet.</p>
        )}
      </div>
    </div>
  );
}
