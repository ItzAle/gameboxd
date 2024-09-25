import { useState, useEffect } from "react";
import {
  FaPlayCircle,
  FaCheckCircle,
  FaListUl,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LibraryTab({ userProfile }) {
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

  useEffect(() => {
    if (userProfile && userProfile.library) {
      const categorizedLibrary = userProfile.library.reduce(
        (acc, game) => {
          // Asegurarse de que el estado del juego es válido
          const validStatus = ["playing", "completed", "toPlay"].includes(
            game.status
          )
            ? game.status
            : "toPlay"; // Si el estado no es válido, lo ponemos en 'toPlay'

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
  }, [userProfile]);

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
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
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            >
              <Link href={`/games/${game.slug}`}>
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{game.name}</h3>
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
                    <span className="capitalize">
                      {status === "toPlay" ? "To Play" : status}
                    </span>
                  </div>
                </div>
              </Link>
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
