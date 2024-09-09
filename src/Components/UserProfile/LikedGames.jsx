import { motion } from "framer-motion";
import { FaHeart, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const LikedGames = ({ userEmail, likedGames, setUserProfile, isOwnProfile }) => {
  const { user } = useAuth();

  const handleUnlike = async (game) => {
    if (!user || !isOwnProfile) {
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        likedGames: arrayRemove(game),
      });

      // Actualizar el estado local
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        likedGames: prevProfile.likedGames.filter(
          (g) => g.gameId !== game.gameId
        ),
      }));

      toast.success("Juego eliminado de favoritos.");
    } catch (error) {
      console.error("Error al quitar el juego de favoritos:", error);
      toast.error("Ocurrió un error al quitar el juego de favoritos.");
    }
  };

  return (
    <div className="mb-8 p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30">
      <h2 className="text-2xl font-semibold mb-2 flex items-center">
        <FaHeart className="mr-2 text-red-500" /> Juegos Favoritos
      </h2>
      {likedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {likedGames.map((game) => (
            <motion.div
              key={game.gameId}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <Link href={`/games/${game.gameId}`}>
                <img
                  src={game.image || "/placeholder-image.jpg"}
                  alt={game.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 rounded-b-lg">
                  <p className="text-sm text-white truncate">{game.name}</p>
                </div>
              </Link>
              {isOwnProfile && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => handleUnlike(game)}
                >
                  <FaTrash />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-lg">Aún no tienes juegos favoritos.</p>
      )}
    </div>
  );
};

export default LikedGames;
