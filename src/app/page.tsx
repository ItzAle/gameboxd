"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransparentNavbar from "../Components/Navbar/TransparentNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaSearch, FaStar } from "react-icons/fa";
import Footer from "../Components/Navbar/Footer";

const gameCoverUrls = [
  "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/03/gta-6-3282307.jpg?tf=3840x",
  "https://imgs.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blackops6/meta/BO6_LP-meta_image.jpg",
  "https://cdn1.epicgames.com/offer/0c40923dd1174a768f732a3b013dcff2/EGS_TheLastofUsPartI_NaughtyDogLLC_S1_2560x1440-3659b5fe340f8fc073257975b20b7f84",
  "https://i.pinimg.com/originals/95/26/f0/9526f08c1e26dcb4f6b9afd9d76af8ab.png",
  "https://i.pinimg.com/736x/29/a0/b4/29a0b495840516b71597e6674fe72256.jpg",
  "https://i.pinimg.com/736x/28/ac/28/28ac28230c663b2a61098a46796b74d9.jpg",
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(Math.floor(Math.random() * gameCoverUrls.length));
    }, 8000); // Cambia el intervalo para una transición más rápida

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
        <TransparentNavbar />
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={gameCoverUrls[currentImageIndex]}
              alt="Game cover"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0 }} // Reducción de la duración para animaciones más rápidas
            />
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }} // Ajusta la duración para animaciones más rápidas
            className="text-6xl font-bold mb-6 text-blue-400"
          >
            Welcome to Gameboxd
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }} // Ajusta la duración para animaciones más rápidas
            className="text-2xl mb-10 max-w-2xl"
          >
            Discover, track, and review your favorite games in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }} // Ajusta la duración para animaciones más rápidas
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/all">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition flex items-center"
              >
                <FaGamepad className="mr-2" /> Browse Games
              </motion.button>
            </Link>
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="bg-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition flex items-center"
              >
                <FaSearch className="mr-2" /> Search
              </motion.button>
              <AnimatePresence>
                {showSearchBar && (
                  <motion.form
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "300px" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-full left-0 mt-2"
                    onSubmit={handleSearch}
                  >
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Features section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }} // Ajusta la duración para animaciones más rápidas
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl"
          >
            <div className="bg-gray-800 p-6 rounded-lg">
              <FaGamepad className="text-4xl mb-4 text-blue-400 mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Extensive Library</h2>
              <p>Access a vast collection of games across all platforms.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <FaStar className="text-4xl mb-4 text-yellow-400 mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Rate and Review</h2>
              <p>Share your thoughts and see what others are saying.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <FaSearch className="text-4xl mb-4 text-green-400 mx-auto" />
              <h2 className="text-xl font-semibold mb-2">Discover New Games</h2>
              <p>
                Find your next favorite game with personalized recommendations.
              </p>
            </div>
          </motion.div>
          <Footer />
        </div>
      </div>
    </>
  );
}
