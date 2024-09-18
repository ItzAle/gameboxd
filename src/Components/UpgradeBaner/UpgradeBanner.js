import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const UpgradeBanner = () => {
  const { user } = useAuth();

  if (user?.isPro) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-8 bg-gradient-to-r from-blue-600 to-purple-600"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Upgrade to PRO</h2>
        <p className="text-white mb-6">
          Get annual statistics, wishlist notifications, no third-party ads, and
          more...
        </p>
        <Link href="/upgrade">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-blue-100 transition duration-300"
          >
            Upgrade to PRO
          </motion.button>
        </Link>
      </div>
    </motion.section>
  );
};

export default UpgradeBanner;
