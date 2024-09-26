import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { db } from "../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";

export default function FollowingTab({ userProfile }) {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!userProfile || !userProfile.following) {
        setIsLoading(false);
        return;
      }

      try {
        const followingUsers = [];
        for (const userId of userProfile.following) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            followingUsers.push({
              id: userId,
              username: userData.username,
              avatarUrl: userData.profilePicture || "/default-avatar.jpg",
            });
          }
        }
        setFollowing(followingUsers);
      } catch (error) {
        console.error("Error fetching following users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [userProfile]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Following
        <span className="ml-2 text-lg text-gray-400">
          ({following.length})
        </span>
      </h2>
      {following.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {following.map((user) => (
            <Link href={`/user/${user.id}`} key={user.id}>
              <div className="bg-gray-800 rounded-lg p-4 flex items-center hover:bg-gray-700 transition-colors duration-200">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-12 h-12 rounded-full mr-3 object-cover"
                />
                <span className="font-semibold">{user.username}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>Aún no sigues a nadie.</p>
      )}
    </div>
  );
}
