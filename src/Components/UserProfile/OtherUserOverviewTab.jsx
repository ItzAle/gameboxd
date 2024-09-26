import React, { useEffect, useState } from "react";
import { FaGamepad, FaStar, FaListUl } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import ProBadge from "../common/ProBadge";
import OtherUserStats from "./OtherUserStats";
import Link from "next/link";

export default function OtherUserOverviewTab({ userProfile }) {
  const [favoriteGames, setFavoriteGames] = useState([]);

  useEffect(() => {
    if (userProfile && Array.isArray(userProfile.likedGames)) {
      console.log("Liked games from userProfile:", userProfile.likedGames);
      setFavoriteGames(userProfile.likedGames);
    } else {
      console.warn(
        "No liked games found in userProfile or likedGames is not an array."
      );
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div>
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  console.log("UserProfile in OtherUserOverviewTab:", userProfile);
  console.log("Favorite games state:", favoriteGames);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 mt-8">User Statistics</h2>
      <OtherUserStats userProfile={userProfile} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Favorite Games</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {favoriteGames.length > 0 ? (
          favoriteGames.map((game, index) => (
            <Link
              className="relative group"
              href={`/games/${game.slug}`}
              key={index}
            >
              <img
                src={game.coverImageUrl || "/placeholder-image.jpg"}
                alt={game.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 rounded-b-lg">
                <p className="text-sm text-white truncate">{game.name}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full">This user has no favorite games yet.</p>
        )}
      </div>

      {userProfile.isPro && (
        <>
          <h2 className="text-2xl font-semibold mb-4 mt-8">
            Platform Stats {<ProBadge />}
          </h2>
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <p className="text-white mb-4">
              Platform stats are private for the user.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
