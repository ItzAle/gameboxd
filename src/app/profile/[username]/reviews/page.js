"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import Link from "next/link";

const RecentReviews = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!username) return;

    const fetchReviews = async () => {
      const q = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs[0]?.data();

      if (userData && userData.reviews) {
        setReviews(userData.reviews);
      } else {
        setReviews([]);
      }
    };

    fetchReviews();
  }, [username]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Recent Reviews</h1>
      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.gameId}
              className="p-4 border border-gray-300 rounded bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/games/${review.gameId}`}>
                <p className="text-xl font-bold hover:underline">
                  {review.gameName}
                </p>
              </Link>
              <p className="text-yellow-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
              <p className="mt-2">{review.comment}</p>
              {review.containsSpoilers && (
                <p className="text-red-500 mt-1">Contains Spoilers</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg">You have not written any reviews yet.</p>
      )}
    </div>
  );
};

export default RecentReviews;
