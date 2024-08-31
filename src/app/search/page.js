"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db, collection, getDocs } from "../../../lib/firebase";
import { query, where, orderBy, limit } from "firebase/firestore";
import jsonp from "jsonp";
import Navbar from "@/Components/Navbar/Navbar";

export default function SearchPage() {
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
          console.error("Search error:", err);
          setError("An error occurred while searching. Please try again.");
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
      console.log("Searching for users with query:", searchQuery);
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        orderBy("name"), // Ordenar por nombre
        where("name", ">=", searchQuery),
        where("name", "<=", searchQuery + "\uf8ff"), // Buscar por prefijo
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      console.log("Matched users:", querySnapshot.size);

      const userResults = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userResults);
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="p-4">Searching...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Search Results for "{searchQuery}"
        </h1>

        <h2 className="text-xl font-semibold mt-4 mb-2">Games</h2>
        {games.length > 0 ? (
          <ul className="list-disc pl-5">
            {games.map((game) => (
              <li key={game.id} className="mb-2">
                <Link
                  href={`/games/${game.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {game.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No games found.</p>
        )}

        <h2 className="text-xl font-semibold mt-6 mb-2">Users</h2>
        {users.length > 0 ? (
          <ul className="list-disc pl-5">
            {users.map((user) => (
              <li key={user.id} className="mb-2">
                <Link
                  href={`/profile/${user.name}`}
                  className="text-blue-600 hover:underline"
                >
                  {user.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </>
  );
}
