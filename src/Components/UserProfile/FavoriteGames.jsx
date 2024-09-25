import { useState } from "react";
import Link from "next/link";
import { FaPlus, FaTimes } from "react-icons/fa";
import AddGameModal from "./AddGameModal";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function FavoriteGames({ userProfile, onUpdateFavorites }) {
  const [favoriteGames, setFavoriteGames] = useState(
    userProfile.likedGames || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const addFavoriteGame = async (game) => {
    if (favoriteGames.length >= 6) {
      toast.error("You can only have 6 favorite games.");
      return;
    }

    const gameToSave = {
      slug: game.slug,
      name: game.name,
      coverImageUrl: game.coverImageUrl,
      likedAt: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        likedGames: [...favoriteGames, gameToSave],
      });

      const updatedGames = [...favoriteGames, gameToSave];
      setFavoriteGames(updatedGames);
      if (typeof onUpdateFavorites === "function") {
        onUpdateFavorites(updatedGames);
      }
      setIsModalOpen(false);
      toast.success("Game added to favorites.");
    } catch (error) {
      console.error("Error adding game to favorites:", error);
      toast.error("An error occurred while adding the game to favorites.");
    }
  };

  const removeFavoriteGame = async (gameSlug) => {
    try {
      const updatedGames = favoriteGames.filter(
        (game) => game.slug !== gameSlug
      );
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        likedGames: updatedGames,
      });

      setFavoriteGames(updatedGames);
      if (typeof onUpdateFavorites === "function") {
        onUpdateFavorites(updatedGames);
      }
      toast.success("Game removed from favorites.");
    } catch (error) {
      console.error("Error removing game from favorites:", error);
      toast.error("An error occurred while removing the game from favorites.");
    }
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {favoriteGames.map((game) => (
          <div key={game.slug} className="relative group">
            <Link href={`/games/${game.slug}`}>
              <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={game.coverImageUrl}
                  alt={game.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-sm truncate">{game.name}</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => removeFavoriteGame(game.slug)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <FaTimes />
            </button>
          </div>
        ))}
        {favoriteGames.length < 6 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
          >
            <FaPlus className="text-2xl text-white" />
          </button>
        )}
      </div>
      <AddGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddGame={addFavoriteGame}
      />
    </div>
  );
}
