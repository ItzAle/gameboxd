"use client";

import { useEffect, useState } from "react";
import {
  query,
  collection,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
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
        alert("You need to be logged in to add a review.");
        return;
      }

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("gameId", "==", game.id),
        where("user", "==", user.email)
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);

      if (!reviewsSnapshot.empty) {
        alert("You have already submitted a review for this game.");
        onClose();
      }
    };

    checkIfReviewExists();
  }, [user, game.id, onClose]);

  const handleSubmit = async () => {
    if (rating === 0 || !comment) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Verificar si game.cover está definido y asignar un valor por defecto si no lo está
      const gameCover = game.cover || ""; // Si game.cover es undefined, usa una cadena vacía

      // Guardar la review si no existe una previa
      const reviewData = {
        gameId: game.id,
        gameName: game.name,
        gameCover: gameCover, // Utilizar la variable que garantiza un valor
        user: user.email,
        rating,
        comment,
        containsSpoilers,
        liked,
      };

      const reviewRef = await addDoc(collection(db, "reviews"), reviewData);

      // Actualizar el perfil del usuario con la reseña y los juegos liked
      const userRef = doc(db, "users", user.email);

      await updateDoc(userRef, {
        reviews: arrayUnion({
          id: reviewRef.id,
          gameId: game.id,
          gameName: game.name,
          rating,
          comment,
          containsSpoilers,
        }),
        likedGames: liked
          ? arrayUnion({
              gameId: game.id,
              gameName: game.name,
              gameCover: gameCover, // Utilizar la variable que garantiza un valor
            })
          : arrayUnion(),
      });

      // Ejecutar la función de callback para guardar en el estado
      onSave(reviewData);

      onClose();
    } catch (error) {
      console.error("Error adding review: ", error);
      alert("There was an error submitting your review.");
    }
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
