"use client";

import { useState } from "react";
import { FaStar, FaRegStar, FaHeart, FaRegHeart } from "react-icons/fa";

export default function AddReviewModal({ game, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleRatingHover = (value) => {
    setHoverRating(value);
  };

  const handleRatingHoverLeave = () => {
    setHoverRating(0);
  };

  const handleSave = () => {
    if (rating > 0 && review.trim()) {
      onSave({ rating, review, containsSpoilers, liked });
      onClose();
    } else {
      alert("Please provide a rating and a review.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Review {game.name}</h2>
        <div className="flex items-center mb-4">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
            <span
              key={value}
              className="cursor-pointer"
              onMouseEnter={() => handleRatingHover(value / 2)}
              onMouseLeave={handleRatingHoverLeave}
              onClick={() => handleRatingClick(value / 2)}
            >
              {value / 2 <= (hoverRating || rating) ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-gray-300" />
              )}
            </span>
          ))}
        </div>
        <textarea
          className="w-full border border-gray-300 p-2 rounded mb-4"
          rows="4"
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="spoilers"
            checked={containsSpoilers}
            onChange={(e) => setContainsSpoilers(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="spoilers" className="text-lg">
            Contains Spoilers
          </label>
        </div>
        <div className="flex items-center mb-4">
          <span className="mr-2">Like this game:</span>
          <button onClick={() => setLiked(!liked)}>
            {liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}
