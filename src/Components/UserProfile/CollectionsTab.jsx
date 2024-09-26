import { useState, useEffect } from "react";
import { FaList, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const CollectionCard = ({ collection, isOwn }) => {
  const firstGame = collection.games?.[0] || {};

  return (
    <div className="relative h-64 rounded-lg overflow-hidden group">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundImage: `url(${
            firstGame.coverImageUrl || "/default-collection-image.jpg"
          })`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="font-semibold text-lg text-white mb-1">
          {collection.name}
        </h3>
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
          {collection.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-400">
            {collection.gameCount} games
          </span>
          <div className="flex space-x-2">
            {isOwn && (
              <>
                <Link
                  href={`/collections/${collection.id}/edit`}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <FaEdit />
                </Link>
                <button className="text-red-400 hover:text-red-300">
                  <FaTrash />
                </button>
              </>
            )}
            <Link
              href={`/collections/${collection.id}`}
              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CollectionsTab({ userProfile }) {
  const [ownCollections, setOwnCollections] = useState([]);
  const [followedCollections, setFollowedCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!userProfile || !userProfile.uid) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's own collections
        const ownQuery = query(
          collection(db, "collections"),
          where("userId", "==", userProfile.uid)
        );
        const ownSnapshot = await getDocs(ownQuery);
        const ownData = ownSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOwnCollections(ownData);

        // Fetch followed collections
        const followedQuery = query(
          collection(db, "collections"),
          where("followers", "array-contains", userProfile.uid)
        );
        const followedSnapshot = await getDocs(followedQuery);
        const followedData = followedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFollowedCollections(followedData);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError("Failed to fetch collections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [userProfile]);

  if (!userProfile) {
    return <div>Loading user profile...</div>;
  }

  if (isLoading) {
    return <div>Loading collections...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Created Collections</h2>
      {ownCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ownCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              isOwn={true}
            />
          ))}
        </div>
      ) : (
        <p>There is no collections created yet.</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">Followed Collections</h2>
      {followedCollections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              isOwn={false}
            />
          ))}
        </div>
      ) : (
        <p>There is no collections followed yet.</p>
      )}
    </div>
  );
}
