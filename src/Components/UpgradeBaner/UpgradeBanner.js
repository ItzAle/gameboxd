import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { FaTimes } from "react-icons/fa";

const UpgradeBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  useEffect(() => {
    const neverShow = localStorage.getItem("neverShowUpgradeBanner");
    if (neverShow === "true") {
      setNeverShowAgain(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem("neverShowUpgradeBanner", "true");
    setNeverShowAgain(true);
    setIsVisible(false);
  };

  if (!user || user.isPro || neverShowAgain) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
        >
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200"
          >
            <FaTimes />
          </button>
          <p className="text-sm mb-3">
            Upgrade to PRO for annual statistics, wishlist notifications, and more!
          </p>
          <div className="flex justify-between items-center">
            <Link href="/upgrade">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 text-sm font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300"
              >
                Upgrade to PRO
              </motion.button>
            </Link>
            <button
              onClick={handleNeverShowAgain}
              className="text-xs text-gray-300 hover:text-white underline"
            >
              Don't show again
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeBanner;
