import { useState, useEffect } from "react";
import {
  FaPlayCircle,
  FaCheckCircle,
  FaListUl,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { toast } from "react-toastify";

export default function LibraryTab({ userProfile, userId, updateUserProfile }) {
  const [library, setLibrary] = useState({
    playing: [],
    completed: [],
    toPlay: [],
  });
  const [expanded, setExpanded] = useState({
    playing: true,
    completed: true,
    toPlay: true,
  });
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    if (userProfile && userProfile.library) {
      const categorizedLibrary = userProfile.library.reduce(
        (acc, game) => {
          if (!game || !game.status) {
            console.warn("Invalid game object in library:", game);
            return acc;
          }
          const validStatus = ["playing", "completed", "toPlay"].includes(
            game.status
          )
            ? game.status
            : "toPlay";

          if (!acc[validStatus]) {
            acc[validStatus] = [];
          }
          acc[validStatus].push(game);
          return acc;
        },
        { playing: [], completed: [], toPlay: [] }
      );

      setLibrary(categorizedLibrary);
    }
  }, [userProfile.library]);

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const moveGame = async (game, newStatus) => {
    if (!userId) {
      console.error("User ID is undefined");
      toast.error("Unable to move game: User ID is missing");
      return;
    }

    try {
      if (!userProfile || !userProfile.library) {
        throw new Error("User profile or library is missing");
      }

      const updatedLibrary = userProfile.library.map((g) =>
        g.slug === game.slug ? { ...g, status: newStatus } : g
      );

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { library: updatedLibrary });

      // Actualizar el estado local inmediatamente
      setLibrary((prev) => {
        const oldStatus = game.status;
        return {
          ...prev,
          [oldStatus]: prev[oldStatus].filter((g) => g.slug !== game.slug),
          [newStatus]: [...prev[newStatus], { ...game, status: newStatus }],
        };
      });

      // Actualizar el userProfile en el componente padre
      await updateUserProfile();

      toast.success(`Game moved to ${newStatus}`);
      setOpenMenu(null);
    } catch (error) {
      console.error("Unable to move game:", error);
      toast.error("Failed to move game: " + error.message);
    }
  };

  const removeGame = async (game) => {
    if (!userId) {
      console.error("User ID is undefined");
      toast.error("No se puede eliminar el juego: falta el ID de usuario");
      return;
    }

    try {
      // Asegúrate de que userProfile y userProfile.library existen
      if (!userProfile || !userProfile.library) {
        throw new Error("El perfil de usuario o la biblioteca faltan");
      }

      const updatedLibrary = userProfile.library.filter(
        (g) => g.slug !== game.slug
      );

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { library: updatedLibrary });

      // Actualizar el estado local
      setLibrary((prev) => {
        const newLibrary = { ...prev };
        Object.keys(newLibrary).forEach((status) => {
          newLibrary[status] = newLibrary[status].filter(
            (g) => g.slug !== game.slug
          );
        });
        return newLibrary;
      });

      // Actualizar el userProfile en el componente padre
      await updateUserProfile();

      toast.success("Game removed from library");
      setOpenMenu(null); // Cerrar el menú después de eliminar el juego
    } catch (error) {
      console.error("Error al eliminar el juego:", error);
      toast.error("Failed to remove game: " + error.message);
    }
  };

  const renderGames = (games, status) => (
    <AnimatePresence>
      {expanded[status] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {games.map((game) => (
            <motion.div
              key={game.slug}
              whileHover={{ scale: 1.05 }}
              className="relative h-64 rounded-lg overflow-hidden shadow-lg"
            >
              <Link href={`/games/${game.slug}`}>
                <div className="absolute inset-0">
                  <img
                    src={game.coverImageUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                </div>
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-semibold text-lg mb-2 text-white">
                    {game.name}
                  </h3>
                  <div className="flex items-center">
                    {status === "playing" && (
                      <FaPlayCircle className="text-blue-500 mr-2" />
                    )}
                    {status === "completed" && (
                      <FaCheckCircle className="text-green-500 mr-2" />
                    )}
                    {status === "toPlay" && (
                      <FaListUl className="text-yellow-500 mr-2" />
                    )}
                    <span className="capitalize text-white">
                      {status === "toPlay" ? "To Play" : status}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenMenu(openMenu === game.slug ? null : game.slug);
                  }}
                  className="text-white bg-gray-700 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-colors duration-200"
                >
                  <FaEllipsisV />
                </button>
                {openMenu === game.slug && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-20">
                    {status !== "playing" && (
                      <button
                        onClick={() => moveGame(game, "playing")}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Move to Playing
                      </button>
                    )}
                    {status !== "completed" && (
                      <button
                        onClick={() => moveGame(game, "completed")}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Move to Completed
                      </button>
                    )}
                    {status !== "toPlay" && (
                      <button
                        onClick={() => moveGame(game, "toPlay")}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                      >
                        Move to To Play
                      </button>
                    )}
                    <button
                      onClick={() => removeGame(game)}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Remove from Library
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderSection = (title, status, icon) => (
    <section className="mb-8">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggleSection(status)}
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-sm bg-gray-700 px-2 py-1 rounded-full">
            {library[status].length}
          </span>
        </h2>
        {expanded[status] ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {renderGames(library[status], status)}
    </section>
  );

  return (
    <div className="space-y-8">
      {renderSection(
        "Playing",
        "playing",
        <FaPlayCircle className="text-blue-500" />
      )}
      {renderSection(
        "Completed",
        "completed",
        <FaCheckCircle className="text-green-500" />
      )}
      {renderSection(
        "To Play",
        "toPlay",
        <FaListUl className="text-yellow-500" />
      )}
    </div>
  );
}
