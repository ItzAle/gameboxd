"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import jsonp from "jsonp";

// Función para obtener la imagen de un juego desde la API de GiantBomb usando JSONP
const fetchGameCover = (gameId) => {
  return new Promise((resolve, reject) => {
    const url = `https://www.giantbomb.com/api/game/3030-${gameId}/?api_key=54a0e172e4af5165c21d0517ca55f7c8f3d34aabY&format=jsonp&callback=?`;

    jsonp(url, null, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const coverUrl = data.results.cover
          ? data.results.cover.small_url
          : "/path/to/placeholder-image.png";
        resolve(coverUrl);
      }
    });
  });
};

export default function OtherUserProfile({ userId }) {
  const [userProfile, setUserProfile] = useState(null);
  const [covers, setCovers] = useState({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        // Obtén el perfil del usuario
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);

          // Obtén las carátulas de los juegos
          const newCovers = {};
          const coverPromises = userData.likedGames.map(async (game) => {
            if (game.gameId) {
              try {
                const coverUrl = await fetchGameCover(game.gameId);
                newCovers[game.gameId] = coverUrl;
              } catch (error) {
                console.error(
                  `Failed to fetch cover for gameId ${game.gameId}:`,
                  error
                );
                newCovers[game.gameId] = "/path/to/placeholder-image.png";
              }
            }
          });
          await Promise.all(coverPromises);
          setCovers(newCovers);
        } else {
          setUserProfile({ likedGames: [], reviews: [] });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (!userProfile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Profile of {userId}</h1>

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
          <p>This user has not liked any games yet.</p>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">User Reviews</h2>
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
          <p>This user has not written any reviews yet.</p>
        )}
      </div>
    </div>
  );
}
