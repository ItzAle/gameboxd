"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaUser, FaSignOutAlt, FaGamepad } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { FiActivity } from "react-icons/fi";

export default function Navbar() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-gray-900 p-4 text-white flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="text-xl font-bold text-blue-400 hover:text-blue-300 transition"
        >
          Gameboxd
        </Link>
        <Link href="/all" className="text-gray-300 hover:text-white transition">
          <FiActivity className="inline mr-2" />
          All Games
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "300px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSearch}
              className="relative"
            >
              <input
                type="text"
                placeholder="Search games or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
              />
            </motion.form>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="text-gray-300 hover:text-white transition"
        >
          <FaSearch />
        </motion.button>

        {user ? (
          <>
            <Link
              href="/profile"
              className="text-gray-300 hover:text-white transition"
            >
              <FaUser />
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white transition"
            >
              <FaSignOutAlt />
            </motion.button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
