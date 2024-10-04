import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Link from "next/link";

const StarRating = ({ rating, setRating }) => {
  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleInputChange = (e) => {
    const value = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 5);
    setRating(value);
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleStarClick(star)}
          className="focus:outline-none"
        >
          <FaStar
            className={`text-2xl ${
              star <= rating ? "text-yellow-400" : "text-gray-600"
            }`}
          />
        </motion.button>
      ))}
      <input
        type="number"
        min="0"
        max="5"
        value={rating}
        onChange={handleInputChange}
        className="ml-2 w-12 p-1 border rounded text-center bg-gray-700 text-white"
      />
    </div>
  );
};

export default function EditReviewModal({ review, onClose, onSave }) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [containsSpoilers, setContainsSpoilers] = useState(review.containsSpoilers);
  const [liked, setLiked] = useState(review.liked);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteGamesCount, setFavoriteGamesCount] = useState(0);
  const { user } = useAuth();
  const [containsProfanity, setContainsProfanity] = useState(false);
  const [characterCount, setCharacterCount] = useState(review.comment.length);
  const [maxCharacters, setMaxCharacters] = useState(500);

  const profanityList = ["nigger", "nigga"];

  const checkProfanity = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    return words.some((word) => profanityList.includes(word));
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    if (newComment.length <= maxCharacters) {
      setComment(newComment);
      setCharacterCount(newComment.length);
      setContainsProfanity(checkProfanity(newComment));
    }
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const likedGames = userData.likedGames || [];
          setFavoriteGamesCount(likedGames.length);
          setIsFavorite(likedGames.some((g) => g.slug === review.gameId));
        }
      } catch (error) {
      }
    };

    const checkUserStatus = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.isPro) {
          setMaxCharacters(1000);
        }
      }
    };

    checkFavoriteStatus();
    checkUserStatus();
  }, [user, review.gameId]);

  const handleToggleFavorite = async () => {
    // Implementar la lógica para agregar/quitar de favoritos
    // Similar a la función en AddReviewModal
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim() === "") {
      toast.error("Please enter a comment");
      return;
    }

    if (containsProfanity) {
      toast.error("Please remove inappropriate language from your review");
      return;
    }

    const updatedReview = {
      ...review,
      rating,
      comment,
      containsSpoilers,
      liked,
    };

    try {
      const reviewRef = doc(db, "reviews", review.id);
      await updateDoc(reviewRef, updatedReview);

      onSave(updatedReview);
      toast.success("Review updated successfully");
      onClose();
    } catch (error) {
      toast.error("An error occurred while updating the review");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 max-w-[90%] text-white"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Edit Review for {review.gameName}
          </h2>

          <p className="text-sm text-gray-400 mb-4">
            Please note that all reviews are subject to moderation. Make sure to
            follow our{" "}
            <Link href="/guidelines" className="text-blue-400 hover:underline">
              community guidelines
            </Link>{" "}
            when writing your review.
          </p>

          {/* Like/Dislike Option */}
          <motion.div
            className="mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-lg mb-2 text-blue-300">
              Did you like the game?
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setLiked(true)}
                className={`px-4 py-2 rounded ${
                  liked === true ? "bg-green-500" : "bg-gray-700"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setLiked(false)}
                className={`px-4 py-2 rounded ${
                  liked === false ? "bg-red-500" : "bg-gray-700"
                }`}
              >
                No
              </button>
            </div>
          </motion.div>

          {/* Star Rating Component */}
          <div className="mb-4">
            <label className="block text-lg mb-2 text-blue-300">Rating:</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>

          {/* Comment Area with animation */}
          <motion.div
            className="mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-lg mb-2 text-blue-300">Review:</label>
            <motion.textarea
              value={comment}
              onChange={handleCommentChange}
              rows="4"
              className="border border-gray-600 p-2 rounded w-full bg-gray-800 text-white"
              whileFocus={{
                scale: 1.02,
                boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)",
              }}
              maxLength={maxCharacters}
            ></motion.textarea>
            <div className="flex justify-between mt-1">
              <span className="text-sm text-gray-400">
                {characterCount}/{maxCharacters}
              </span>
              {containsProfanity && (
                <p className="text-red-500 text-sm">
                  The review contains inappropriate language. Please review it.
                </p>
              )}
            </div>
          </motion.div>

          {/* Spoilers Option with animation */}
          <motion.div
            className="mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="inline-flex items-center">
              <motion.input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="form-checkbox bg-gray-700 border-gray-600 text-blue-500"
                whileTap={{ scale: 0.9 }}
              />
              <span className="ml-2 text-gray-300">Contains Spoilers</span>
            </label>
          </motion.div>

          {/* Favorite Option with animation */}
          <motion.div
            className="mb-4"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleToggleFavorite}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center text-gray-300 hover:text-white"
              disabled={!isFavorite && favoriteGamesCount >= 6}
            >
              {isFavorite ? (
                <AiFillHeart className="text-red-500 text-2xl mr-2" />
              ) : (
                <AiOutlineHeart className="text-2xl mr-2" />
              )}
              <span>
                {isFavorite ? "Remove from favorites" : "Add to favorites"}
              </span>
            </motion.button>
            {!isFavorite && favoriteGamesCount >= 6 && (
              <p className="text-sm text-red-400 mt-2">
                You have reached the maximum of 6 favorite games. Remove one to
                add another.
              </p>
            )}
          </motion.div>

          {/* Action Buttons with animation */}
          <motion.div
            className="flex justify-end"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={onClose}
              className="bg-gray-700 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                containsProfanity ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={{ scale: containsProfanity ? 1 : 1.05 }}
              whileTap={{ scale: containsProfanity ? 1 : 0.95 }}
              disabled={containsProfanity}
            >
              Update Review
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
