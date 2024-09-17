"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaSearch, FaStar } from "react-icons/fa";
import Footer from "../Navbar/Footer";
import { useMediaQuery } from "react-responsive";
import { useAuth } from "../../context/AuthContext";
import ActivityFeed from "../Activity/Activity";
import RecentGames from "../RecentGames/RecentGames";
import HomeFeed from "../HomeFeed/HomeFeed";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";
import UpcomingGames from "../UpcomingGames/UpcomingGames";
import RecentGamesGrid from "../RecentGamesGrid/RecentGamesGrid";

const gameCoverUrls = [
  "https://imgs.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blackops6/meta/BO6_LP-meta_image.jpg",
  "https://motionbgs.com/media/184/fenrir-ragnorak-from-god-of-war.jpg",
  "https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2024/03/gta-6-3282307.jpg?tf=3840x",
  "https://cdn1.epicgames.com/offer/0c40923dd1174a768f732a3b013dcff2/EGS_TheLastofUsPartI_NaughtyDogLLC_S1_2560x1440-3659b5fe340f8fc073257975b20b7f84",
  "https://i.pinimg.com/originals/95/26/f0/9526f08c1e26dcb4f6b9afd9d76af8ab.png",
  "https://4kwallpapers.com/images/wallpapers/marvels-spider-man--13276.jpeg",
  "https://images8.alphacoders.com/131/1316637.jpeg",
  "https://preview.redd.it/42tt9tc5jsh31.jpg?auto=webp&s=d466a206101d476a6f57568f6bdde95907196a00",
  "https://wallpapercat.com/w/full/a/f/5/71411-3840x2160-desktop-4k-red-dead-redemption-background-photo.jpg",
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(() =>
    Math.floor(Math.random() * gameCoverUrls.length)
  );
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(Math.floor(Math.random() * gameCoverUrls.length));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isMounted && isMobile) {
      const featureInterval = setInterval(() => {
        setCurrentFeatureIndex((prevIndex) => (prevIndex + 1) % 3);
      }, 5000);

      return () => clearInterval(featureInterval);
    }
  }, [isMounted, isMobile]);

  const features = [
    {
      icon: <FaGamepad className="text-4xl mb-4 text-blue-400" />,
      title: "Extensive Library",
      description: "Access a vast collection of games across all platforms.",
    },
    {
      icon: <FaStar className="text-4xl mb-4 text-yellow-400" />,
      title: "Rate and Review",
      description: "Share your thoughts and see what others are saying.",
    },
    {
      icon: <FaSearch className="text-4xl mb-4 text-green-400" />,
      title: "Discover New Games",
      description: "Find your next favorite game.",
    },
  ];

  const renderFeatures = () => {
    if (!isMounted) return null;

    if (isMobile) {
      return (
        <div className="relative h-64 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentFeatureIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gray-800 p-6 rounded-lg w-full mx-4 flex flex-col items-center justify-center text-center">
                {features[currentFeatureIndex].icon}
                <h2 className="text-xl font-semibold mb-2">
                  {features[currentFeatureIndex].title}
                </h2>
                <p>{features[currentFeatureIndex].description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-lg flex flex-col items-center justify-center text-center h-full"
            >
              <div className="mb-4">{feature.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
        <TransparentNavbar />
        {user ? (
          <AuthenticatedContent
            currentImageIndex={currentImageIndex}
            renderFeatures={renderFeatures}
            username={
              user.displayName || user.email?.split("@")[0] || "Usuario"
            }
          />
        ) : (
          <UnauthenticatedContent
            currentImageIndex={currentImageIndex}
            handleSearch={handleSearch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSearchBar={showSearchBar}
            setShowSearchBar={setShowSearchBar}
            renderFeatures={renderFeatures}
          />
        )}
        <div className="mb-16">
          {" "}
          {/* Añadido: margen inferior */}
          <UpgradeBanner />
        </div>
        <Footer />
      </div>
    </>
  );
}

const UnauthenticatedContent = ({
  currentImageIndex,
  handleSearch,
  searchTerm,
  setSearchTerm,
  showSearchBar,
  setShowSearchBar,
  renderFeatures,
}) => {
  return (
    <>
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
            transition={{ duration: 1.0 }}
          />
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl font-bold mb-6 text-blue-400"
        >
          Welcome to Gameboxd
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-2xl mb-10 max-w-2xl"
        >
          Discover, track, and review your favorite games in one place.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition flex items-center"
            >
              <FaGamepad className="mr-2" /> Get Started
            </motion.button>
          </Link>
          <motion.div className="relative">
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

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 w-full max-w-4xl"
        >
          {renderFeatures()}
        </motion.div>
      </div>
    </>
  );
};

const AuthenticatedContent = ({
  currentImageIndex,
  renderFeatures,
  username,
}) => {
  return (
    <>
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
            transition={{ duration: 1.0 }}
          />
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-bold mb-12 text-blue-400"
        >
          Welcome, {username}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="w-full max-w-7xl"
        >
          <h2 className="text-3xl font-semibold mb-6">Upcoming Games</h2>
          <RecentGamesGrid />
        </motion.div>
      </div>
    </>
  );
};
