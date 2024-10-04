import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export const deleteReview = async (reviewId, userEmail) => {
  try {
    const batch = writeBatch(db);

    // Eliminar la reseña de la colección de reseñas
    const reviewRef = doc(db, "reviews", reviewId);
    batch.delete(reviewRef);

    // Eliminar la reseña del documento del usuario
    const userRef = doc(db, "users", userEmail);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedReviews = userData.reviews.filter(
        (review) => review.id !== reviewId
      );
      batch.update(userRef, { reviews: updatedReviews });
    }

    await batch.commit();

    return true;
  } catch (error) {
    return false;
  }
};

export const addReview = async (reviewData, userEmail) => {
  try {
    const batch = writeBatch(db);

    // Añadir la reseña a la colección de reseñas
    const reviewsRef = collection(db, "reviews");
    const newReviewRef = doc(reviewsRef);
    batch.set(newReviewRef, {
      ...reviewData,
      id: newReviewRef.id,
      user: userEmail,
    });

    // Añadir la reseña al documento del usuario
    const userRef = doc(db, "users", userEmail);
    batch.update(userRef, {
      reviews: [
        ...((await getDoc(userRef)).data().reviews || []),
        { ...reviewData, id: newReviewRef.id },
      ],
    });

    await batch.commit();

    return newReviewRef.id;
  } catch (error) {
    return null;
  }
};

export const getReviewsByUser = async (userEmail) => {
  try {
    const q = query(collection(db, "reviews"), where("user", "==", userEmail));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
};
