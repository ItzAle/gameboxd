import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db, collection, getDocs } from "../../../lib/firebase";
import { query, where, orderBy, limit } from "firebase/firestore";
import jsonp from "jsonp";
import { motion } from "framer-motion";
import { FaUser, FaGamepad } from "react-icons/fa";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      setError(null);
      Promise.all([searchGames(searchQuery), searchUsers(searchQuery)])
        .then(() => setIsLoading(false))
        .catch((err) => {
          console.error("Error de búsqueda:", err);
          setError(
            "Ocurrió un error durante la búsqueda. Por favor, inténtalo de nuevo."
          );
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const searchGames = (query) => {
    return new Promise((resolve, reject) => {
      const apiUrl = "https://www.giantbomb.com/api/games/";
      const params = {
        api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
        format: "jsonp",
        json_callback: "jsonpCallback",
        limit: 10,
        filter: `name:${query}`,
        field_list: "name,image,id",
      };

      const urlParams = new URLSearchParams(params).toString();
      const apiUrlWithParams = `${apiUrl}?${urlParams}`;

      jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          setGames(data.results || []);
          resolve();
        }
      });
    });
  };

  const searchUsers = async (searchQuery) => {
    try {
      console.log("Buscando usuarios con la consulta:", searchQuery);
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("name"),
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      console.log("Usuarios encontrados:", querySnapshot.size);

      const userResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userResults);
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <>
        <TransparentNavbar />
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TransparentNavbar />
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TransparentNavbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="container mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-blue-400"
          >
            Resultados de búsqueda para {searchQuery}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold mt-8 mb-4 flex items-center">
              <FaGamepad className="mr-2" /> Juegos
            </h2>
            {games.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/games/${game.id}`} className="block group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform group-hover:scale-105 bg-gray-800 aspect-[3/4]">
                        {game.image ? (
                          <img
                            src={game.image.small_url}
                            alt={`Portada de ${game.name}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-500">
                            Sin imagen
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-lg font-semibold line-clamp-2">
                            {game.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No se encontraron juegos.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mt-12 mb-4 flex items-center">
              <FaUser className="mr-2" /> Usuarios
            </h2>
            {users.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/profile/${user.name}`}
                      className="block group"
                    >
                      <div className="flex flex-col items-center p-4 rounded-lg bg-gray-800 transition-all duration-300 transform group-hover:scale-105 group-hover:bg-gray-700">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={`Perfil de ${user.name}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-600 text-gray-300">
                              <FaUser size={32} />
                            </div>
                          )}
                        </div>
                        <h3 className="text-center font-semibold text-blue-400 group-hover:text-blue-300">
                          {user.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No se encontraron usuarios.</p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
