"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { FaRocket, FaCheck, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkProStatus = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().isPro) {
          setIsPro(true);
        }
      }
    };

    checkProStatus();
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Exclusive notifications to new releases",
    "Ad-free experience",
    "Priority customer support",
    "Up to 1000 characters in your reviews",
    "Lifetime access",
    "Custom Homepage",
    "Custom Username colors and effects",
  ];

  if (isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center"
        >
          <FaRocket className="text-6xl text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            You&apos;re Already Pro!
          </h1>
          <p className="text-gray-600 mb-4">
            You already have access to all Pro features.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white rounded-lg py-2 px-4 font-semibold transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center mb-8"
        >
          <FaRocket className="text-6xl text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Upgrade to Pro
          </h1>
          <p className="text-gray-600">
            Unlock the full potential of your gaming experience
          </p>
        </motion.div>

        <motion.ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center text-gray-700"
            >
              <FaCheck className="text-green-500 mr-2" />
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6"
        >
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white rounded-lg py-3 px-4 font-semibold text-lg transition duration-300 ease-in-out transform hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <FaLock className="mr-2" />
                Upgrade to Pro Now
              </span>
            )}
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          Only one pay of 8€ for a lifetime access.
        </motion.p>
      </motion.div>
    </div>
  );
}
