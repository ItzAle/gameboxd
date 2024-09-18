"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function UpgradeSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) return;

      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id"
      );
      if (!sessionId) {
        router.push("/upgrade");
        return;
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId: user.uid }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Payment verified successfully:", data.message);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 10000); // Stop confetti after 10 seconds
        } else {
          console.error("Payment verification failed:", data.error);
          router.push("/upgrade");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        router.push("/upgrade");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [user, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg shadow-xl text-center"
        >
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            Verifying your payment...
          </h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 10,
          }}
        >
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-gray-800 mb-4"
        >
          Thank you for upgrading to Pro!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-600 mb-6"
        >
          Your account has been successfully upgraded.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => router.push("/profile")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition duration-300 ease-in-out transform hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Go to your profile
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
