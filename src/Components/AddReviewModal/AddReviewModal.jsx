"use client";

import { useState } from "react";

export default function AddReviewModal({ game, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);

  const handleSubmit = () => {
    if (rating === 0 || !comment) {
      alert("Please fill in all fields.");
      return;
    }

    onSave({
      gameId: game.id,
      user: "Anonymous", 
      rating,
      comment,
      containsSpoilers,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add Review for {game.name}</h2>
        <div className="mb-4">
          <label className="block text-lg mb-2">Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border border-gray-300 p-2 rounded"
          >
            <option value={0}>Select rating</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Star{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Review:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="border border-gray-300 p-2 rounded w-full"
          ></textarea>
        </div>
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
