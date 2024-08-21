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
    return <p className="text-blue-500">Loading profile...</p>;
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
                src={
                  userProfile.profilePicture ||
                  "/path/to/default-profile-pic.png"
                }
                alt="Profile Picture"
                className="w-32 h-32 object-cover rounded-full shadow-lg"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Bio</h2>
              <p className="text-lg">
                {userProfile.bio || "No bio available."}
              </p>
            </div>
          </div>

          {/* Liked Games Section */}
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Ccacs Games</h2>
            {userProfile.likedGames && userProfile.likedGames.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-64">
                {userProfile.likedGames.map((game) => (
                  <li key={game.gameId} className="mb-2">
                    <Link href={`/games/${game.gameId}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                          <img
                            src={
                              covers[game.gameId] ||
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
              <p className="text-lg">This user has not liked any games yet.</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="md:col-span-2">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">User Reviews</h2>
            {userProfile.reviews && userProfile.reviews.length > 0 ? (
              <ul className="space-y-4">
                {userProfile.reviews.map((review) => (
                  <li
                    key={review.gameId}
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
              <p className="text-lg">
                This user has not written any reviews yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
