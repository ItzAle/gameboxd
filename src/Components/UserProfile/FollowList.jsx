import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaTimes } from "react-icons/fa";

export default function FollowList({ type, users, onClose }) {
  const [userDetails, setUserDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };

    fetchUserDetails();
  }, [users]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-gray-800 p-6 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {type === "followers" ? "Followers" : "Following"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaTimes size={24} />
            </motion.button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-t-2 border-blue-500 rounded-full"
              />
            </div>
          ) : (
            <ul className="space-y-4">
              <AnimatePresence>
                {userDetails.map((user) => (
                  <motion.li
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center space-x-4 bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-12 h-12 text-gray-400" />
                    )}
                    <Link
                      href={`/profile/${user.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex-grow"
                    >
                      <span className="font-medium">{user.username}</span>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
          {!isLoading && userDetails.length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              No {type === "followers" ? "followers" : "following"} yet.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
