import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";

export default function AddGameModal({ isOpen, onClose, onAddGame }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [allGames, setAllGames] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://gbxd-api.vercel.app/api/games");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setAllGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filteredGames = allGames.filter(
        (game) =>
          game.name.toLowerCase().includes(lowercasedTerm) ||
          (game.genres &&
            game.genres.some((genre) =>
              genre.toLowerCase().includes(lowercasedTerm)
            )) ||
          (game.platforms &&
            game.platforms.some((platform) =>
              platform.toLowerCase().includes(lowercasedTerm)
            ))
      );
      setSearchResults(filteredGames);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allGames]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 max-w-full text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Game to Favorites</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 pl-10"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="text-center">
              <Loader2 />
            </p>
          ) : (
            searchResults.map((game) => (
              <div
                key={game.id}
                className="flex items-center p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => onAddGame(game)}
              >
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <span>{game.name}</span>
              </div>
            ))
          )}
          {!isLoading && searchResults.length === 0 && searchTerm && (
            <p className="text-center">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
