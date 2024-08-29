import React, { createContext, useState, useContext, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(collection(db, "reviews"));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(fetchedReviews);
    };

    fetchReviews();
  }, []);

  const updateReview = (reviewId, newData) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId ? { ...review, ...newData } : review
      )
    );
  };

  const deleteReview = (reviewId) => {
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review.id !== reviewId)
    );
  };

  return (
    <ReviewsContext.Provider
      value={{ reviews, setReviews, updateReview, deleteReview }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};
