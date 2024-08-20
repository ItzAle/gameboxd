"use client";

import React, { useEffect, useState } from "react";
import jsonp from "jsonp";
import Link from "next/link";
import { Search } from "lucide-react";

window.jsonpCallback = function (data) {
  window.jsonpData = data;
};

export default function Component() {
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
      sort: "date_added:desc",
      field_list: "name,image,id,date_added",
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
        setGames(data.results);
      }
    });
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleSearch = () => {
    setGames([]);
    fetchGames(searchTerm);
  };

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in">
        Latest Games
      </h1>
      <div className="flex items-center space-x-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search games"
          value={searchTerm}
          onChange={handleInputChange}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <button
          onClick={handleSearch}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {games.map((game, index) => (
            <Link href={`/games/${game.id}`} key={game.id} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  {game.image ? (
                    <img
                      src={game.image.small_url}
                      alt={`${game.name} cover`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h2 className="text-lg font-semibold line-clamp-2">
                    {game.name}
                  </h2>
                  <p className="text-sm mt-1">
                    Added: {new Date(game.date_added).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
