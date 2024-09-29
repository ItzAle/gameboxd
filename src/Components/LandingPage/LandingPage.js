"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useHalloween } from "../../context/HalloweenContext";
import { useChristmas } from "../../context/ChristmasContext";
import { christmasCoverUrls } from "./ChristmasCoverUrls";
import { halloweenCoverUrls } from "./HalloweenCoverUrls";
import { usualCoverUrls } from "./UsualCoversUrl";
import CustomizableHomePage from "../CustomizableHomePage/CustomizableHomePage";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import UpgradeBanner from "../UpgradeBaner/UpgradeBanner";
import RecentGamesGrid from "../RecentGamesGrid/RecentGamesGrid";
import ChristmasGamesGrid from "../RecentGamesGrid/ChristmasGamesGrid";
import HalloweenGamesGrid from "../RecentGamesGrid/HalloweenGamesGrid";
import FooterLanding from "../Navbar/FooterLanidng";
import HalloweenParticles from "../HalloweenParticles";
import ChristmasParticles from "../ChristmasParticles";
import ReactConfetti from "react-confetti";
import { Switch } from "@headlessui/react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { FaGamepad, FaSearch, FaStar, FaTimes } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import ActivityFeed from "../Activity/Activity";
import RecentGames from "../RecentGames/RecentGames";
import HomeFeed from "../HomeFeed/HomeFeed";
import UpcomingGames from "../UpcomingGames/UpcomingGames";

const NewYearCelebration = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div className="bg-gray-800 p-8 rounded-lg text-center text-white shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">
          Happy new year!
        </h2>
        <p className="mb-6 text-gray-300">
          From gameboxd we wish you happy new year!
        </p>
        <button
          onClick={onClose}
          className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:bg-yellow-400 transition duration-300 font-semibold"
        >
          Cerrar
        </button>
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { user, isLoading } = useAuth();
  const [isCustomizable, setIsCustomizable] = useState(false);
  const { isHalloweenMode } = useHalloween();
  const { isChristmasMode } = useChristmas();
  const [timeUntilNewYear, setTimeUntilNewYear] = useState("");
  const [showNewYearCelebration, setShowNewYearCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSimulatingNewYear, setIsSimulatingNewYear] = useState(false);
  const [useCustomLayout, setUseCustomLayout] = useState(true);
  const simulationStartTime = useRef(null);

  const coverUrls = isChristmasMode
    ? christmasCoverUrls
    : isHalloweenMode
    ? halloweenCoverUrls
    : usualCoverUrls;

  useEffect(() => {
    const fetchUserPreference = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUseCustomLayout(userData.useCustomLayout !== false);
        }
      }
    };
    fetchUserPreference();
  }, [user]);

  const handleLayoutChange = async (newValue) => {
    setUseCustomLayout(newValue);
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { useCustomLayout: newValue });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % coverUrls.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [coverUrls.length]);

  useEffect(() => {
    const updateNewYearCountdown = () => {
      const now = new Date();
      let newYear;
      let difference;

      if (isSimulatingNewYear) {
        if (!simulationStartTime.current) {
          simulationStartTime.current = now.getTime();
        }
        const elapsedTime = now.getTime() - simulationStartTime.current;
        difference = 5000 - elapsedTime; // 5 segundos de simulación
      } else {
        newYear = new Date(now.getFullYear() + 1, 0, 1);
        difference = newYear - now;
      }

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        if (isSimulatingNewYear) {
          setTimeUntilNewYear(`${seconds}s`);
        } else {
          setTimeUntilNewYear(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeUntilNewYear("¡Feliz Año Nuevo!");
        setShowNewYearCelebration(true);
        if (isSimulatingNewYear) {
          setIsSimulatingNewYear(false);
          simulationStartTime.current = null;
        }
      }
    };

    const countdownInterval = setInterval(updateNewYearCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, [isSimulatingNewYear]);

  const startNewYearSimulation = () => {
    setIsSimulatingNewYear(true);
    simulationStartTime.current = null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?q=${searchTerm}`);
  };

  const handleCloseNewYearCelebration = () => {
    setShowNewYearCelebration(false);
    setShowConfetti(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Fondo con animación */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={coverUrls[currentImageIndex]}
            alt="Game cover"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          />
        </AnimatePresence>
      </div>

      {/* Partículas */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {isHalloweenMode && <HalloweenParticles />}
        {isChristmasMode && <ChristmasParticles />}
      </div>

      {/* Confetti para Año Nuevo */}
      {showConfetti && (
        <div className="fixed inset-0 z-20 pointer-events-none">
          <ReactConfetti recycle={false} numberOfPieces={200} />
        </div>
      )}

      {/* Contenido principal */}
      <div
        className={`relative z-30 flex flex-col min-h-screen ${
          isChristmasMode
            ? "christmas-mode"
            : isHalloweenMode
            ? "halloween-mode"
            : ""
        }`}
      >
        <TransparentNavbar />

        <div className="flex justify-end items-center px-4 pt-20">
          {user && user.isPro && (
            <div className="flex items-center">
              <span className="mr-2 text-white">Classic</span>
              <Switch
                checked={useCustomLayout}
                onChange={handleLayoutChange}
                className={`${
                  useCustomLayout ? "bg-blue-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    useCustomLayout ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="ml-2 text-white">PRO</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showNewYearCelebration && (
            <NewYearCelebration onClose={handleCloseNewYearCelebration} />
          )}
        </AnimatePresence>

        {!isLoading && user && !user.isPro && <UpgradeBanner />}

        <div className="flex-grow flex flex-col items-center justify-start text-center  pb-4">
          {(isChristmasMode || isSimulatingNewYear) && (
            <div className="mb-4 text-white text-2xl font-bold">
              <p>Countdown to New Year: {timeUntilNewYear}</p>
            </div>
          )}

          {user && user.isPro && useCustomLayout ? (
            <CustomizableHomePage />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-4xl"
            >
              <h2 className="text-2xl font-semibold mb-3 text-white">
                {isChristmasMode
                  ? ""
                  : isHalloweenMode
                  ? "Halloween Games"
                  : "Upcoming Games"}
              </h2>
              {isChristmasMode ? (
                <ChristmasGamesGrid />
              ) : isHalloweenMode ? (
                <HalloweenGamesGrid />
              ) : (
                <RecentGamesGrid />
              )}
            </motion.div>
          )}
        </div>

        <FooterLanding />
      </div>

      {/* Confetti para Año Nuevo */}
      {showNewYearCelebration && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={2000}
            gravity={0.1}
          />
        </div>
      )}
    </div>
  );
}
