import React, { useState } from "react";
import { FaEdit, FaTrash, FaStar } from "react-icons/fa";
import Link from "next/link";

const Reviews = ({ reviews, onEditReview, onDeleteReview, isOwnProfile }) => {
  const [editingReview, setEditingReview] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
  };

  const handleSaveClick = async () => {
    const success = await onEditReview(
      editingReview.id,
      editedComment,
      editedRating
    );
    if (success) {
      setEditingReview(null);
    }
  };

  return (
    <div>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-b pb-4">
              <Link
                href={`/games/${review.gameId}`}
                className="text-blue-500 hover:underline"
              >
                <h3 className="text-xl font-semibold">{review.gameName}</h3>
              </Link>
              {isOwnProfile && editingReview && editingReview.id === review.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                  />
                  <div className="flex items-center">
                    <span className="mr-2">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`cursor-pointer ${
                          star <= editedRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setEditedRating(star)}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSaveClick}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <span className="mr-2">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2">{review.comment}</p>
                  {isOwnProfile && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleEditClick(review)}
                        className="text-blue-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg">Aún no tienes reseñas.</p>
      )}
    </div>
  );
};

export default Reviews;
