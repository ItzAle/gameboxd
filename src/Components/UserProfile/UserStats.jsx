import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

export default function UserStats({ userProfile }) {
  const [stats, setStats] = useState({
    reviewsCount: 0,
    gamesPlayedCount: 0,
    collectionsCount: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || !user.uid) {
        return;
      }

      try {
        // Obtener reviews
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("userId", "==", user.uid)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsCount = reviewsSnapshot.size;

        // Obtener juegos jugados (sumando los que están en "playing" y "completed")
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        let gamesPlayedCount = 0;
        if (userData && userData.library) {
          const playingGames = userData.library.filter(
            (game) => game.status === "playing"
          ).length;
          const completedGames = userData.library.filter(
            (game) => game.status === "completed"
          ).length;
          gamesPlayedCount = playingGames + completedGames;
        }

        // Obtener colecciones
        const collectionsQuery = query(
          collection(db, "collections"),
          where("userId", "==", user.uid)
        );
        const collectionsSnapshot = await getDocs(collectionsQuery);
        const collectionsCount = collectionsSnapshot.size;

        setStats({
          reviewsCount,
          gamesPlayedCount,
          collectionsCount,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Reviews" value={stats.reviewsCount} />
      <StatCard title="Games Played" value={stats.gamesPlayedCount} />
      <StatCard title="Collections" value={stats.collectionsCount} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
