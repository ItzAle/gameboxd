import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const UpcomingGames = () => {
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://api.gameboxd.me/api/games/upcoming",
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al cargar los juegos próximos");
        }
        const data = await response.json();

        // Tomar solo los primeros 3 juegos próximos
        const nextGames = data.slice(0, 3);

        setUpcomingGames(nextGames);
      } catch (error) {
        console.error("Error fetching upcoming games:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingGames();
  }, []);

  if (isLoading) {
    return (
      <div className="text-white text-center">Cargando juegos próximos...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // ... importaciones y lógica de estado ...

  return (
    <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold mb-6 text-white">
          Próximos Lanzamientos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingGames.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg"
            >
              <Link href={`/games/${game.slug}`}>
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {game.name}
                  </h3>
                  <p className="text-gray-300">
                    Lanzamiento:{" "}
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/upcoming">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300"
            >
              Ver todos los próximos lanzamientos
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UpcomingGames;
