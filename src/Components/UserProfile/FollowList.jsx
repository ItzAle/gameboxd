import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

export default function FollowList({ type, users, onClose }) {
  const [userDetails, setUserDetails] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const details = await Promise.all(
        users.map(async (userId) => {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            return { id: userId, ...userSnap.data() };
          }
          return null;
        })
      );
      setUserDetails(details.filter(Boolean));
    };

    fetchUserDetails();
  }, [users]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {type === "followers" ? "Seguidores" : "Siguiendo"}
        </h2>
        <ul className="space-y-4">
          {userDetails.map((user) => (
            <li key={user.id} className="flex items-center space-x-4">
              <img
                src={user.profilePicture || "/default-avatar.png"}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <Link href={`/profile/${user.id}`} className="text-blue-400 hover:underline">
                {user.username}
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}