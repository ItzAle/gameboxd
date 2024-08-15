"use client";

import React, { useEffect, useState } from "react";
import jsonp from "jsonp";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";

// Funcion para jsonp
window.jsonpCallback = function (data) {
  window.jsonpData = data;
};

function AllGames() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 100;
  const apiUrl = "https://www.giantbomb.com/api/games/";

  const fetchGames = (searchTerm = "") => {
    const params = {
      api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
      format: "jsonp",
      json_callback: "jsonpCallback",
      offset: offset,
      limit: limit,
    };

    if (searchTerm) {
      params.filter = `name:${searchTerm}`;
    }

    const urlParams = new URLSearchParams(params).toString();
    const apiUrlWithParams = `${apiUrl}?${urlParams}`;

    jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
      if (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } else {
        const newGames = data.results;

        if (newGames.length === 0) {
          setHasMore(false);
        } else {
          newGames.sort((a, b) => {
            const releaseDateA =
              a.releases && a.releases.length > 0
                ? new Date(a.releases[0].date)
                : new Date(0); // Primer release de la lista
            const releaseDateB =
              b.releases && b.releases.length > 0
                ? new Date(b.releases[0].date)
                : new Date(0); // Primer release de la lista
            return releaseDateB - releaseDateA; // Orden descendente
          });

          if (offset === 0) {
            setGames(newGames);
          } else {
            setGames((prevGames) => [...prevGames, ...newGames]);
          }
          setOffset((prevOffset) => prevOffset + limit);
        }
      }
    });
  };

  useEffect(() => {
    fetchGames(searchTerm);
  }, [searchTerm]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setOffset(0); // Reiniciar el offset cuando se realiza una nueva búsqueda
    setHasMore(true); // Reiniciar cuando se realiza una nueva búsqueda
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Games</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search games"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 p-2 rounded mr-2"
        />
      </div>
      <InfiniteScroll
        dataLength={games.length}
        next={() => fetchGames(searchTerm)}
        hasMore={hasMore}
        loader={<h4 className="text-center">Loading...</h4>}
        endMessage={
          <p className="text-center text-gray-500">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <Link href={`/games/${game.id}`} key={game.id}>
              <div className="p-4 border border-gray-300 rounded bg-white shadow-md cursor-pointer">
                <h2 className="text-lg font-semibold truncate">{game.name}</h2>
                {game.image ? (
                  <img
                    src={game.image.small_url}
                    alt={`${game.name} cover`}
                    className="mt-2 w-full h-auto object-cover rounded"
                  />
                ) : (
                  <p className="text-gray-500 mt-2">Image not available</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

export default AllGames;
