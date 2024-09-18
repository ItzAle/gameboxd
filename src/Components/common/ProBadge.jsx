"use client";

import { motion, useAnimation } from "framer-motion";
import { useState, useEffect } from "react";

const ProBadge = () => {
  const [clickCount, setClickCount] = useState(0);
  const controls = useAnimation();
  const [isOnFire, setIsOnFire] = useState(false);
  const [isGolden, setIsGolden] = useState(false);

  const handleClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (clickCount === 3) {
      controls.start({
        rotate: [0, 360],
        scale: [1, 1.5, 1],
        transition: { duration: 0.5 },
      });
    } else if (clickCount === 5) {
      setIsOnFire(true);
      setTimeout(() => setIsOnFire(false), 3000);
    } else if (clickCount === 10) {
      setIsGolden(true);
      controls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.5 },
      });
    }
  }, [clickCount, controls]);

  return (
    <motion.span
      className={`relative inline-flex items-center justify-center ml-2 px-4 py-1 text-xs font-bold text-white rounded-full overflow-hidden cursor-pointer select-none ${
        isGolden
          ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
          : "bg-gradient-to-r from-purple-600 to-pink-600"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={controls}
      onClick={handleClick}
    >
      <span className="relative z-10">PRO</span>
      {!isGolden && (
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            animation: "pulse 2s infinite",
            opacity: 0.3,
          }}
        />
      )}
      {isOnFire && (
        <div className="fire-effect">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      )}
      {isGolden && (
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(45deg, #FFD700, #FFA500, #FF8C00, #FFD700)",
            backgroundSize: "400% 400%",
            animation: "gradientBG 15s ease infinite",
            opacity: 0.6,
          }}
        />
      )}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(0.8); }
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .fire-effect {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 5px;
          height: 5px;
          background: #ff3d00;
          border-radius: 50%;
          animation: rise 1s infinite;
        }
        @keyframes rise {
          0% { 
            bottom: -5px;
            opacity: 1;
          }
          100% { 
            bottom: 100%;
            opacity: 0;
          }
        }
        .particle:nth-child(even) {
          background: #ffeb3b;
        }
        .particle:nth-child(4n) {
          height: 8px;
          width: 8px;
          animation-duration: 1.25s;
        }
        .particle:nth-child(3n) {
          height: 3px;
          width: 3px;
          animation-duration: 0.75s;
        }
      `}</style>
    </motion.span>
  );
};

export default ProBadge;
