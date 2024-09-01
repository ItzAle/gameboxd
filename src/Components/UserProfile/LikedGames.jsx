import Link from "next/link";
import { motion } from "framer-motion";
import { FaHeart, FaTimes } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Asegúrate de que la ruta sea correcta
import { toast } from "react-toastify";

const LikedGames = ({ likedGames, covers, userEmail }) => {
  const handleRemoveFavorite = async (gameId) => {
    if (!userEmail) {
      console.error("userEmail is undefined.");
      toast.error("User email is not defined.");
      return;
    }

    if (
      confirm("Are you sure you want to remove this game from your favorites?")
    ) {
      try {
        const userRef = doc(db, "users", userEmail);

        // Filtramos los juegos para excluir el juego con el gameId específico
        const updatedLikedGames = likedGames.filter(
          (likedGame) => likedGame.gameId !== gameId
        );

        await updateDoc(userRef, {
          likedGames: updatedLikedGames,
        });

        toast.success("The game has been removed from your favorites.");
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast.error(
          "An error occurred while removing the game from your favorites."
        );
      }
    }
  };

  return (
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
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-80 overflow-hidden">
          {likedGames.map((game, index) => (
            <motion.li
              key={game.gameId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative overflow-hidden"
            >
              <Link href={`/games/${game.gameId}`}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
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

              {/* Botón de eliminación */}
              <button
                onClick={() => handleRemoveFavorite(game.gameId)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
              >
                <FaTimes />
              </button>
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
};

export default LikedGames;
