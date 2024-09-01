"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUser, FaSignOutAlt, FaGamepad } from "react-icons/fa";

export default function TransparentNavbar() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 p-4 transition-colors duration-300 ${
        isScrolled ? "bg-gray-900/80 backdrop-blur-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-blue-400 transition"
        >
          Gameboxd
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            href="/all"
            className="text-white hover:text-blue-400 transition"
          >
            <FaGamepad className="inline mr-2" />
            All Games
          </Link>

          {session ? (
            <>
              <Link
                href="/profile"
                className="text-white hover:text-blue-400 transition"
              >
                <FaUser />
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => signOut()}
                className="text-white hover:text-blue-400 transition"
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
      </div>
    </motion.nav>
  );
}
