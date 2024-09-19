import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const RecentGames = () => {
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://gbxd-api.vercel.app/api/games");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Ordenar los juegos por fecha de lanzamiento (más reciente primero)
        const sortedGames = data.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );

        // Tomar solo los primeros 6 juegos
        const latestGames = sortedGames.slice(0, 6);

        setRecentGames(latestGames);
      } catch (error) {
        console.error("Error fetching recent games:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentGames();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-blue-900">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {recentGames.map((game, index) => (
        <motion.div
          key={game.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link href={`/games/${game.slug}`}>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              {game.coverImageUrl ? (
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentGames;
