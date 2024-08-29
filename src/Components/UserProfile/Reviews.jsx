import React, { useState } from 'react';
import { FaEdit, FaTrash, FaStar } from 'react-icons/fa';

const Reviews = ({ reviews, onEditReview, onDeleteReview }) => {
  const [editingReview, setEditingReview] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
  };

  const handleSaveClick = async () => {
    const success = await onEditReview(editingReview.id, editedComment, editedRating);
    if (success) {
      setEditingReview(null);
    }
  };

  const handleDeleteClick = async (reviewId) => {
    await onDeleteReview(reviewId);
  };

  return (
    <div>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-b pb-4">
              {editingReview && editingReview.id === review.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex items-center">
                    <span className="mr-2">Calificación:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`cursor-pointer ${star <= editedRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setEditedRating(star)}
                      />
                    ))}
                  </div>
                  <button onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Guardar
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg">{review.comment}</p>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">Calificación:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <button onClick={() => handleEditClick(review)} className="text-blue-500 mr-2">
                      <FaEdit className="inline mr-1" /> Editar
                    </button>
                    <button onClick={() => handleDeleteClick(review.id)} className="text-red-500">
                      <FaTrash className="inline mr-1" /> Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No tienes reseñas aún.</p>
      )}
    </div>
  );
};

export default Reviews;
