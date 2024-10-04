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

export default function FollowersTab({ userProfile }) {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!userProfile || !userProfile.followers) {
        setIsLoading(false);
        return;
      }

      try {
        const followerUsers = [];
        for (const userId of userProfile.followers) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            followerUsers.push({
              id: userId,
              username: userData.username,
              avatarUrl: userData.profilePicture || "/default-avatar.jpg",
            });
          }
        }
        setFollowers(followerUsers);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
  }, [userProfile]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Followers
        <span className="ml-2 text-lg text-gray-400">({followers.length})</span>
      </h2>
      {followers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followers.map((user) => (
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
        <p>There are no followers yet.</p>
      )}
    </div>
  );
}
