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

  const ReviewItem = ({ review }) => (
    <li className="border-b border-gray-700 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <Link
        href={`/games/${review.gameId}`}
        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
      >
        <h3 className="text-xl font-semibold mb-2">{review.gameName}</h3>
      </Link>
      {isOwnProfile && editingReview && editingReview.id === review.id ? (
        <EditReviewForm review={review} />
      ) : (
        <ReviewContent review={review} />
      )}
    </li>
  );

  const EditReviewForm = ({ review }) => (
    <div className="space-y-4">
      <textarea
        value={editedComment}
        onChange={(e) => setEditedComment(e.target.value)}
        className="w-full p-3 border rounded bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        rows={4}
      />
      <div className="flex items-center">
        <span className="mr-2 text-gray-300">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setEditedRating(star)}
            className="focus:outline-none"
          >
            <FaStar
              className={`text-2xl ${
                star <= editedRating ? "text-yellow-400" : "text-gray-600"
              }`}
            />
          </button>
        ))}
      </div>
      <button
        onClick={handleSaveClick}
        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Save Changes
      </button>
    </div>
  );

  const ReviewContent = ({ review }) => (
    <>
      <div className="flex items-center mb-2">
        <span className="mr-2 text-gray-300">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              star <= review.rating ? "text-yellow-400" : "text-gray-600"
            }`}
          />
        ))}
      </div>
      <p className="text-gray-300 mb-2">
        {review.liked
          ? "User liked this game"
          : "User did not like this game"}
      </p>
      <p className="text-gray-300 mb-4">{review.comment}</p>
      {isOwnProfile && (
        <div className="flex space-x-4">
          <button
            onClick={() => handleEditClick(review)}
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center"
          >
            <FaEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={() => onDeleteReview(review.id)}
            className="text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center"
          >
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      {reviews.length > 0 ? (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-400">
          You haven&apos;t written any reviews yet.
        </p>
      )}
    </div>
  );
};

export default Reviews;
