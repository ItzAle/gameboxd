import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import ReactConfetti from "react-confetti";

const NewYearCelebration = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const hasShownCelebration =
      localStorage.getItem("newYearCelebrationShown") === "true";

    if (!hasShownCelebration) {
      setIsVisible(true);
      localStorage.setItem("newYearCelebrationShown", "true");

      // Cerrar la celebración después de 10 segundos
      setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="fixed top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-2">Happy new year</h2>
            <p className="text-sm mb-3">
              We hope that this new year will be full of gaming.
            </p>
          </motion.div>
          <div className="fixed inset-0 z-40 pointer-events-none">
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
            />
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewYearCelebration;
