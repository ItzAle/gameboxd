import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

const LikedGames = ({ likedGames, covers }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30"
  >
    <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
      <FaHeart className="mr-2 text-red-500" /> Liked Games
    </h2>
    {likedGames.length > 0 ? (
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-80">
        {likedGames.map((game, index) => (
          <motion.li
            key={game.gameId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link href={`/games/${game.gameId}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 h-full bg-gray-700"
              >
                <div className="aspect-w-3 aspect-h-4">
                  <img
                    src={
                      covers[game.gameId] || "/path/to/placeholder-image.png"
                    }
                    alt={game.gameName}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="text-center font-medium text-sm">
                    {game.gameName}
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.li>
        ))}
      </ul>
    ) : (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-lg text-gray-300"
      >
        You have not liked any games yet.
      </motion.p>
    )}
  </motion.div>
);

export default LikedGames;
