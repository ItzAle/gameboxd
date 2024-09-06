import { useState, useEffect, useContext, createContext } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Asegúrate de que esta ruta sea correcta

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "reviews"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(reviewsArray);
    });

    return () => unsubscribe();
  }, []);

  const value = { reviews, setReviews };

  return (
    <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
