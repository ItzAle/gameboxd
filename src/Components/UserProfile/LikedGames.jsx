import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const LikedGames = ({
  userEmail,
  favoriteGames,
  isOwnProfile,
  gameDetails,
}) => {
  // Verificar si favoriteGames es undefined o null, y proporcionar un array vacío como valor predeterminado
  const games = favoriteGames || [];

  return (
    <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
      <h2 className="text-2xl font-semibold mb-2 flex items-center">
        Favorite Games
      </h2>
      {games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {games.slice(0, 6).map((game) => {
            if (!game || !game.slug) {
              console.warn('Game without slug detected:', game);
              return null;
            }
            return (
              <motion.div
                key={game.slug}
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <Link href={`/games/${game.slug}`}>
                  <img
                    src={
                      (gameDetails[game.slug] &&
                        gameDetails[game.slug].coverImageUrl) ||
                      game.coverImageUrl ||
                      "/placeholder-image.jpg"
                    }
                    alt={game.name || 'Game cover'}
                    width={300}
                    height={400}
                    className="w-full h-40 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 rounded-b-lg">
                    <p className="text-sm text-white truncate">{game.name || 'Unknown game'}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-lg">No favorite games yet.</p>
      )}
    </div>
  );
};

export default LikedGames;
