"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import jsonp from "jsonp";
import AddReviewModal from "../../../Components/AddReviewModal/AddReviewModal";
//import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
//import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
window.jsonpCallback = function (data) {
  window.jsonpData = data;
};

export default function GameDetailsPage({ params }) {
  const { id } = params;
  const { data: session } = useSession();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [likedGames, setLikedGames] = useState([]);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddReviewClick = async () => {
    if (!session || !session.user) {
      toast.error("You need to be logged in to add a review.");
      return;
    }

    try {
      // Verificar si ya existe una reseña para este juego y usuario
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("gameId", "==", id),
        where("user", "==", session.user.name) // Aquí verificamos por el nombre del usuario
      );

      const reviewsSnapshot = await getDocs(reviewsQuery);

      if (!reviewsSnapshot.empty) {
        toast.error("You have already submitted a review for this game.");
      } else {
        setShowModal(true); // Solo abrimos el modal si no hay una reseña existente
      }
    } catch (error) {
      console.error("Error checking existing reviews:", error);
      toast.error("An error occurred while checking for existing reviews.");
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const apiUrl = `https://www.giantbomb.com/api/game/${id}/`;
        const params = {
          api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
          format: "jsonp",
          json_callback: "jsonpCallback",
        };

        const urlParams = new URLSearchParams(params).toString();
        const apiUrlWithParams = `${apiUrl}?${urlParams}`;

        jsonp(
          apiUrlWithParams,
          { param: "json_callback" },
          async (err, data) => {
            if (err) {
              console.error("Error fetching game details:", err);
              setError(err);
              return;
            }

            if (!data || !data.results) {
              console.error("Invalid data received from API");
              setError(new Error("Invalid data received from API"));
              return;
            }

            setGame(data.results);

            try {
              // Cargar reviews desde Firestore
              const reviewsQuery = query(
                collection(db, "reviews"),
                where("gameId", "==", id)
              );
              const reviewsSnapshot = await getDocs(reviewsQuery);
              const loadedReviews = reviewsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setReviews(loadedReviews);

              // Verificar si el juego está en favoritos
              if (session?.user?.id) {
                const docRef = doc(db, "favorites", `${session.user.id}_${id}`);
                const docSnap = await getDoc(docRef);

                setIsFavorite(docSnap.exists() ? docSnap.data().liked : false);
              }
            } catch (firestoreError) {
              console.error("Error accessing Firestore:", firestoreError);
              setError(firestoreError);
            }
          }
        );
      } catch (error) {
        console.error("Error in fetchGameDetails:", error);
        setError(error);
      }
    };

    fetchGameDetails();
  }, [id, session]);

  const handleSaveReview = async (newReview) => {
    try {
      const reviewToSave = {
        ...newReview,
        user: session.user.name,
        gameId: id,
      };
      const docRef = await addDoc(collection(db, "reviews"), reviewToSave);
      setReviews((prevReviews) => [
        ...prevReviews,
        { ...reviewToSave, id: docRef.id },
      ]);

      // Si el usuario ha dado "like", añadir el juego a la lista de juegos favoritos
      if (newReview.liked) {
        setLikedGames((prevLikedGames) => [...prevLikedGames, game]);
      }
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!game) {
    return <div className="text-center">Loading...</div>;
  }

  // Formatear la fecha de lanzamiento
  const formattedReleaseDate = game.original_release_date
    ? new Date(game.original_release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // Calcular la media de todas las reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-8">
      {/* Imagen del juego a la izquierda */}
      <div className="w-full lg:w-1/3">
        {game.image && (
          <img
            src={game.image.medium_url}
            alt={`${game.name} cover`}
            className="w-full h-auto object-cover rounded mb-4"
          />
        )}
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-lg">{game.deck || "No description available."}</p>
        </div>
      </div>

      {/* Detalles del juego a la derecha */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-4xl font-bold mb-4">{game.name}</h1>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Game Details</h2>
          <p>
            <strong>Release Date:</strong> {formattedReleaseDate}
          </p>
          <p>
            <strong>Platforms:</strong>{" "}
            {game.platforms?.map((p) => p.name).join(", ") || "N/A"}
          </p>
          <p>
            <strong>Genres:</strong>{" "}
            {game.genres?.map((g) => g.name).join(", ") || "N/A"}
          </p>
        </div>

        {/* Mostrar la media de las reviews */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-2">Average Rating</h2>
          <p className="text-lg">
            {reviews.length > 0
              ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reviews)`
              : "No reviews yet."}
          </p>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {session ? (
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-600 transition mb-4"
              onClick={handleAddReviewClick}
            >
              Add Review
            </button>
          ) : (
            <p className="text-red-500 mb-4">
              You need to log in to add a review.
            </p>
          )}
        </div>

        {/* Lista de reviews */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-gray-300 rounded bg-white shadow-md"
                >
                  <p className="font-bold">{review.user}</p>
                  <p className="text-yellow-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                    {review.containsSpoilers && (
                      <p className="text-red-500">Contains Spoilers</p>
                    )}
                  </p>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>

      {/* Modal para añadir una review */}
      {showModal && (
        <AddReviewModal
          game={game}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReview}
        />
      )}
    </div>
  );
}
