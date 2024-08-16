"use client";

import { useEffect, useState } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { query, collection, where, getDocs } from "firebase/firestore";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { db } from "../../../lib/firebase";
import { useSession } from "next-auth/react";
export default function AddReviewModal({ game, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [liked, setLiked] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  const handleToggleFavorite = () => {
    setLiked((prevLiked) => !prevLiked);
  };
  useEffect(() => {
    const checkIfReviewExists = async () => {
      if (!user) {
        toast.error("You need to be logged in to add a review.");
        return;
      }

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("gameId", "==", game.id),
        where("user", "==", user.name)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);

      if (!reviewsSnapshot.empty) {
        toast.error("You have already submitted a review for this game.");
        onClose();
      }
    };

    checkIfReviewExists();
  }, [user, game.id, onClose]);

  const handleSubmit = async () => {
    if (rating === 0 || !comment) {
      toast.error("Please fill in all fields.");
      return;
    }

    // Verificar si el usuario ya ha añadido una review para este juego
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("gameId", "==", game.id),
      where("user", "==", user.name)
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    if (!reviewsSnapshot.empty) {
      toast.error("You have already reviewed this game.");
      return;
    }

    // Guardar la review si no existe una previa
    onSave({
      gameId: game.id,
      user: user.name, // Utiliza la información del usuario autenticado
      rating,
      comment,
      containsSpoilers,
      liked,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Add Review for {game.name}</h2>

        {/* Selector de Estrellas */}
        <div className="mb-4">
          <label className="block text-lg mb-2">Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value={0}>Select rating</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Star{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Área de Comentario */}
        <div className="mb-4">
          <label className="block text-lg mb-2">Review:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="border border-gray-300 p-2 rounded w-full"
          ></textarea>
        </div>

        {/* Opción de Spoilers */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={containsSpoilers}
              onChange={(e) => setContainsSpoilers(e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Contains Spoilers</span>
          </label>
        </div>

        {/* Opción de Favorito */}
        <div className="mb-4 flex items-center">
          <button
            className="text-red-500 focus:outline-none"
            onClick={handleToggleFavorite}
          >
            {liked ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
          </button>
          <span className="ml-2">Mark as Favorite</span>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded-md ml-2 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
