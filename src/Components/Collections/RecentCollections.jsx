import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

export default function RecentCollections() {
  const [recentCollections, setRecentCollections] = useState([]);

  useEffect(() => {
    const fetchRecentCollections = async () => {
      const q = query(
        collection(db, "collections"),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const collectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentCollections(collectionsData);
    };

    fetchRecentCollections();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Recent Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentCollections.map((collection) => (
          <Link href={`/collections/${collection.id}`} key={collection.id}>
            <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700">
              <h3 className="font-semibold">{collection.name}</h3>
              <p className="text-sm text-gray-400">
                {collection.gameCount} games
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {collection.description}
              </p>
              <div className="mt-2">
                {collection.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-500 text-white rounded-full px-2 py-1 text-xs mr-2 mb-2"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
