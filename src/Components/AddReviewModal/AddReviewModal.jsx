"use client";

import React, { useEffect, useState } from "react";
import {
  query,
  collection,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../lib/firebase";
import { useSession } from "next-auth/react";

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

export default function AddReviewModal({ game, onClose, onSave }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [liked, setLiked] = useState(false);
  const { data: session } = useSession();
  const [isBrowser, setIsBrowser] = useState(false);
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
        where("user", "==", user.name)
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
    if (comment && rating === 0) {
      alert("Please provide a rating if you are writing a review.");
      return;
    }

    try {
      const gameCover = game.cover || "";

      const reviewData = {
        gameId: game.id,
        gameName: game.name,
        gameCover: gameCover,
        user: user.email,
        rating,
        comment,
        containsSpoilers,
        liked,
      };

      if (rating > 0 || comment) {
        const reviewRef = await addDoc(collection(db, "reviews"), reviewData);

        const userRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: user.email,
            reviews: [],
            likedGames: [],
          });
        }

        await updateDoc(userRef, {
          reviews: arrayUnion({
            id: reviewRef.id,
            gameId: game.id,
            gameName: game.name,
            rating,
            comment,
            containsSpoilers,
          }),
        });
      }
      if (liked) {
        const userRef = doc(db, "users", user.email);
        await updateDoc(userRef, {
          likedGames: arrayUnion({
            gameId: game.id,
            gameName: game.name,
            gameCover: gameCover,
          }),
        });
      }

      onSave(reviewData);
      onClose();
    } catch (error) {
      console.error("Error adding review: ", error);
      alert("There was an error submitting your review.");
    }
  };

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
        style={{
          position: "fixed",
          left: "0",
          top: "0",
          right: "0",
          bottom: "0",
          width: "100vw",
          height: "100vh",
          margin: "0",
          padding: "0",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 p-6 rounded-lg shadow-lg w-96 max-w-[90%] text-white"
        >
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Add Review for {game.name}
          </h2>

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
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="border border-gray-600 p-2 rounded w-full bg-gray-800 text-white"
              whileFocus={{
                scale: 1.02,
                boxShadow: "0px 0px 8px rgba(59, 130, 246, 0.5)",
              }}
            ></motion.textarea>
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
            >
              {liked ? (
                <AiFillHeart className="text-red-500 text-2xl mr-2" />
              ) : (
                <AiOutlineHeart className="text-2xl mr-2" />
              )}
              <span>Add to Liked Games</span>
            </motion.button>
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Review
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
