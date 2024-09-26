import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaTrash,
  FaEdit,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaHeart,
} from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import EditReviewModal from "../EditReviewModal/EditReviewModal";

export default function ReviewsTab({ userProfile, isOwnProfile }) {
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      let userId;
      if (isOwnProfile) {
        userId = user?.uid;
      } else {
        userId = userProfile?.id;
      }

      console.log("Fetching reviews for userId:", userId);
      console.log("isOwnProfile:", isOwnProfile);
      console.log("userProfile:", userProfile);

      if (!userId) {
        console.error("User ID is undefined");
        setIsLoading(false);
        return;
      }

      try {
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", userId)
        );
        console.log("Query:", reviewsQuery);
        const reviewsSnapshot = await getDocs(reviewsQuery);
        console.log("Query snapshot:", reviewsSnapshot);
        const reviewsData = reviewsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Reviews data:", reviewsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [userProfile, isOwnProfile, user]);

  if (isLoading) {
    return <div>Cargando reseñas...</div>;
  }

  const handleDelete = async (reviewId) => {
    if (confirm("¿Estás seguro de que quieres borrar esta review?")) {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(reviews.filter((review) => review.id !== reviewId));
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleLike = async (reviewId, isLike) => {
    const reviewRef = doc(db, "reviews", reviewId);
    const action = isLike ? "likes" : "dislikes";
    const oppositeAction = isLike ? "dislikes" : "likes";

    await updateDoc(reviewRef, {
      [action]: arrayUnion(user.uid),
      [oppositeAction]: arrayRemove(user.uid),
    });

    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            [action]: [...(review[action] || []), user.uid],
            [oppositeAction]: (review[oppositeAction] || []).filter(
              (id) => id !== user.uid
            ),
          };
        }
        return review;
      })
    );
  };

  const handleComment = async (reviewId, comment) => {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      comments: arrayUnion({
        userId: user.uid,
        text: comment,
        createdAt: new Date(),
      }),
    });

    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          return {
            ...review,
            comments: [
              ...(review.comments || []),
              { userId: user.uid, text: comment, createdAt: new Date() },
            ],
          };
        }
        return review;
      })
    );
  };

  const renderStats = () => {
    const totalReviews = reviews.length;
    const totalLikes = reviews.reduce(
      (sum, review) => sum + (review.likes?.length || 0),
      0
    );
    const totalDislikes = reviews.reduce(
      (sum, review) => sum + (review.dislikes?.length || 0),
      0
    );
    const totalComments = reviews.reduce(
      (sum, review) => sum + (review.comments?.length || 0),
      0
    );

    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-300">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem title="Total Reviews" value={totalReviews} icon={FaStar} />
          <StatItem title="Total Likes" value={totalLikes} icon={FaThumbsUp} />
          <StatItem
            title="Total Dislikes"
            value={totalDislikes}
            icon={FaThumbsDown}
          />
          <StatItem
            title="Total Comments"
            value={totalComments}
            icon={FaComment}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderStats()}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <Link href={`/games/${review.gameId}`}>
                <h3 className="text-xl font-semibold text-blue-300">
                  {review.gameName}
                </h3>
              </Link>
              <div>
                <button
                  onClick={() => handleEdit(review)}
                  className="mr-2 text-blue-500"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i < review.rating ? "text-yellow-500" : "text-gray-500"
                  }
                />
              ))}
              <span className="ml-2">{review.rating}/5</span>
            </div>
            <p className="mb-2">{review.comment}</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(review.id, true)}
                className="flex items-center"
              >
                <FaThumbsUp className="mr-1" /> {review.likes?.length || 0}
              </button>
              <button
                onClick={() => handleLike(review.id, false)}
                className="flex items-center"
              >
                <FaThumbsDown className="mr-1" /> {review.dislikes?.length || 0}
              </button>
              <button className="flex items-center">
                <FaComment className="mr-1" /> {review.comments?.length || 0}
              </button>
              {review.liked && (
                <FaHeart className="text-red-500" title="You like this game" />
              )}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        ))}
      </div>
      {showEditModal && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedReview) => {
            setReviews(
              reviews.map((r) =>
                r.id === updatedReview.id ? updatedReview : r
              )
            );
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

const StatItem = ({ title, value, icon: Icon }) => (
  <div className="flex items-center">
    <Icon className="text-blue-400 mr-2" />
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);
