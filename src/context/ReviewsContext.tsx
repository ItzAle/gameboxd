// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   ReactNode,
// } from "react";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   deleteDoc,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { db } from "../../lib/firebase";

// interface Review {
//   id: string;
//   [key: string]: any;
// }

// interface ReviewsContextType {
//   reviews: Review[];
//   addReview: (newReview: Review) => void;
//   updateReview: (
//     reviewId: string,
//     updatedData: Partial<Review>
//   ) => Promise<void>;
//   deleteReview: (reviewId: string) => Promise<void>;
// }

// const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// export const useReviews = () => {
//   const context = useContext(ReviewsContext);
//   if (context === undefined) {
//     throw new Error("useReviews must be used within a ReviewsProvider");
//   }
//   return context;
// };

// export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [reviews, setReviews] = useState<Review[]>([]);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       const reviewsQuery = query(collection(db, "reviews"));
//       const reviewsSnapshot = await getDocs(reviewsQuery);
//       const reviewsData = reviewsSnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setReviews(reviewsData as Review[]);
//     };

//     fetchReviews();
//   }, []);

//   const addReview = (newReview: Review) => {
//     setReviews((prevReviews) => [...prevReviews, newReview]);
//   };

//   const updateReview = async (
//     reviewId: string,
//     updatedData: Partial<Review>
//   ) => {
//     try {
//       const reviewRef = doc(db, "reviews", reviewId);
//       await updateDoc(reviewRef, updatedData);
//       setReviews((prevReviews) =>
//         prevReviews.map((review) =>
//           review.id === reviewId ? { ...review, ...updatedData } : review
//         )
//       );
//     } catch (error) {
//       console.error("Error al actualizar la reseña:", error);
//     }
//   };

//   const deleteReview = async (reviewId: string) => {
//     try {
//       const reviewRef = doc(db, "reviews", reviewId);
//       await deleteDoc(reviewRef);
//       setReviews((prevReviews) =>
//         prevReviews.filter((review) => review.id !== reviewId)
//       );
//     } catch (error) {
//       console.error("Error al eliminar la reseña:", error);
//     }
//   };

//   return (
//     <ReviewsContext.Provider
//       value={{ reviews, addReview, updateReview, deleteReview }}
//     >
//       {children}
//     </ReviewsContext.Provider>
//   );
// };
