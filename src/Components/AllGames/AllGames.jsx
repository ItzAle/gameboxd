"use client";

import React, { useEffect, useState } from "react";
import jsonp from "jsonp";
import Link from "next/link";

window.jsonpCallback = function (data) {
  window.jsonpData = data;
};

function AllGames() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const limit = 100;
  const apiUrl = "https://www.giantbomb.com/api/games/";

  const fetchGames = (term = "") => {
    setIsLoading(true);
    const params = {
      api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
      format: "jsonp",
      json_callback: "jsonpCallback",
      limit: limit,
      sort: "number_of_user_reviews:desc,date_added:desc",
      filter: term ? `name:${term}` : "",
    };

    const urlParams = new URLSearchParams(params).toString();
    const apiUrlWithParams = `${apiUrl}?${urlParams}`;

    jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
      setIsLoading(false);
      if (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } else {
        const newGames = data.results;
        setGames(newGames);
      }
    });
  };

  // Cargar juegos al iniciar la página
  useEffect(() => {
    fetchGames(); // Llamada sin término de búsqueda para cargar los juegos predeterminados
  }, []);

  const handleSearch = () => {
    setGames([]); // Reiniciar juegos antes de realizar la búsqueda
    fetchGames(searchTerm);
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Games</h1>
      <div className="mb-4 flex">
        <input
          type="text"
          placeholder="Search games"
          value={searchTerm}
          onChange={handleInputChange}
          className="border border-gray-300 p-2 rounded mr-2 flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>
      {isLoading ? (
        <h4 className="text-center">Loading...</h4>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game) => (
            <Link href={`/games/${game.id}`} key={game.id}>
              <div className="p-4 border border-gray-300 rounded bg-white shadow-md cursor-pointer h-full flex flex-col items-center">
                <h2
                  className="text-lg font-semibold text-center mb-2 truncate"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "3.6rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {game.name}
                </h2>
                {game.image && (
                  <div className="w-full h-48 flex justify-center items-center">
                    <img
                      src={game.image.small_url}
                      alt={`${game.name} cover`}
                      className="max-w-full max-h-full"
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllGames;
