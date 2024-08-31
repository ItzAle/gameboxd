"use client";

import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState } from "react";

const StarField = ({ count = 100 }) => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
    }));
    setStars(newStars);
  }, [count]);

  return (
    <div className="absolute inset-0">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x * 100}%`,
            top: `${star.y * 100}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
      >
        <h1 className="text-4xl font-bold mb-4">
          You&apos;re already logged in
        </h1>
        <p className="text-lg mb-8">Welcome, {session.user.name}!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut()}
          className="bg-red-500 text-white px-6 py-3 rounded-full text-lg hover:bg-red-600 transition"
        >
          Sign out
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gray-900">
      <StarField count={200} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Login to Gameboxd
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signIn("google")}
          className="flex items-center justify-center w-full bg-white text-gray-800 px-6 py-3 rounded-full text-lg hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-2" />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
}
