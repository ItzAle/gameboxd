import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

const Reviews = ({ reviews, onEditReview, onDeleteReview }) => {
  const [editingReview, setEditingReview] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
  };

  const handleSaveClick = () => {
    onEditReview(editingReview.gameId, editedComment, editedRating);
    setEditingReview(null);
  };

  const handleDeleteClick = (gameId) => {
    onDeleteReview(gameId);
  };

  return (
    <div>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.gameId}
              className="p-4 border border-gray-300 rounded bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {editingReview && editingReview.gameId === review.gameId ? (
                <div>
                  <textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    className="p-2 border rounded w-full"
                  />
                  <div className="flex items-center mt-2">
                    <label className="mr-2">Rating:</label>
                    <select
                      value={editedRating}
                      onChange={(e) => setEditedRating(Number(e.target.value))}
                      className="p-2 border rounded"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSaveClick}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <Link href={`/games/${review.gameId}`}>
                    <p className="text-xl font-bold hover:underline">
                      {review.gameName}
                    </p>
                  </Link>
                  <p className="text-yellow-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  <p className="mt-2">{review.comment}</p>
                  {review.containsSpoilers && (
                    <p className="text-red-500 mt-1">Contains Spoilers</p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditClick(review)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(review.gameId)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg">You have not written any reviews yet.</p>
      )}
    </div>
  );
};

export default Reviews;
