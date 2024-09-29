"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { FaGamepad, FaSearch, FaStar } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import styles from "./LandingPage.module.css";
import "../../styles/christmas.css";
import "../../styles/halloween.css";
import NewYearCelebration from "./NewYearCelebration";

const MemoizedTransparentNavbar = React.memo(TransparentNavbar);
const MemoizedUpgradeBanner = React.memo(UpgradeBanner);
const MemoizedFooterLanding = React.memo(FooterLanding);
const MemoizedCustomizableHomePage = React.memo(CustomizableHomePage);
const MemoizedRecentGamesGrid = React.memo(RecentGamesGrid);
const MemoizedChristmasGamesGrid = React.memo(ChristmasGamesGrid);
const MemoizedHalloweenGamesGrid = React.memo(HalloweenGamesGrid);

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoading } = useAuth();
  const { isHalloweenMode } = useHalloween();
  const { isChristmasMode } = useChristmas();
  const [timeUntilNewYear, setTimeUntilNewYear] = useState("");
  const [showNewYearCelebration, setShowNewYearCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSimulatingNewYear, setIsSimulatingNewYear] = useState(false);
  const [useCustomLayout, setUseCustomLayout] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isNewYear, setIsNewYear] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [coverUrls, setCoverUrls] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setCoverUrls(
      isChristmasMode
        ? christmasCoverUrls
        : isHalloweenMode
        ? halloweenCoverUrls
        : usualCoverUrls
    );
  }, [isChristmasMode, isHalloweenMode]);

  const fetchUserPreference = useCallback(async () => {
    if (user && user.isPro) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUseCustomLayout(userData.useCustomLayout !== false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUserPreference();
  }, [fetchUserPreference]);

  const handleLayoutChange = useCallback(
    async (newValue) => {
      setUseCustomLayout(newValue);
      if (user && user.isPro) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { useCustomLayout: newValue });
      }
    },
    [user]
  );

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % coverUrls.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isMounted, coverUrls.length]);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const hasShownCelebration =
      localStorage.getItem("newYearCelebrationShown") === "true";

    const calculateCountdown = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1);
      const difference = newYear - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeUntilNewYear(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setIsNewYear(true);
        setTimeUntilNewYear("Happy new year!");
        setShowNewYearCelebration(true);

        if (!hasShownCelebration) {
          setShowCelebration(true);
          localStorage.setItem("newYearCelebrationShown", "true");

          setTimeout(() => {
            setShowCelebration(false);
          }, 10000);
        }
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  const startNewYearSimulation = useCallback(() => {
    setIsSimulatingNewYear(true);
    let count = 5;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setTimeout(() => {
          setIsSimulatingNewYear(false);
          setCountdown(5);
        }, 3000);
      }
    }, 1000);
  }, []);

  const renderGameGrid = useMemo(() => {
    if (isChristmasMode) return <MemoizedChristmasGamesGrid />;
    if (isHalloweenMode) return <MemoizedHalloweenGamesGrid />;
    return <MemoizedRecentGamesGrid />;
  }, [isChristmasMode, isHalloweenMode]);

  const renderLandingContent = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-20 px-4"
      >
        <h1 className={`text-6xl font-extrabold ${styles.animatedText} mb-8`}>
          Gameboxd
        </h1>
        <h2 className="text-4xl font-bold text-white mb-4">Your game diary</h2>
        <h3 className="text-2xl text-gray-300 mb-8">
          Log the games you have played.
          <br />
          Save the ones you want to play.
          <br />
          Tell your friends which ones are good.
        </h3>
        <Link
          href="/signup"
          className={`${styles.animatedButton} text-white font-bold py-4 px-8 rounded-full text-xl transition duration-300 inline-flex items-center`}
        >
          <FaGamepad className="mr-2" />
          Start now — its free!
        </Link>
        <p className="mt-8 text-gray-400">
          The social network for video game lovers.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <FaGamepad className="text-4xl text-blue-400 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-white mb-2">
              Log the games you have played.
            </h4>
            <p className="text-gray-400">
              Keep track of all the games you have played and the ones you want
              to play.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <FaSearch className="text-4xl text-blue-500 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-white mb-2">
              Discover new games
            </h4>
            <p className="text-gray-400">
              Find new games based on your tastes and those of your friends.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
            <FaStar className="text-4xl text-blue-300 mb-4 mx-auto" />
            <h4 className="text-xl font-semibold text-white mb-2">
              Share your opinions
            </h4>
            <p className="text-gray-400">
              Write reviews, rate games and share your thoughts with the
              community.
            </p>
          </div>
        </div>
        {isChristmasMode && (
          <div className="mt-8">
            <button
              onClick={startNewYearSimulation}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
              disabled={isSimulatingNewYear}
            >
              {isSimulatingNewYear
                ? countdown > 0
                  ? `${countdown}...`
                  : "Happy New Year!"
                : "Simular Año Nuevo (5s)"}
            </button>
          </div>
        )}
      </motion.div>
    ),
    [
      isChristmasMode,
      isSimulatingNewYear,
      countdown,
      startNewYearSimulation,
      styles.animatedText,
      styles.animatedButton,
    ]
  );

  return (
    <div className="relative min-h-screen bg-gray-900">
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
      <div className="fixed inset-0 z-50 pointer-events-none">
        {isChristmasMode && <ChristmasParticles />}
        {isHalloweenMode && <HalloweenParticles />}
      </div>
      {showConfetti && (
        <div className="fixed inset-0 z-20 pointer-events-none">
          <ReactConfetti recycle={false} numberOfPieces={200} />
        </div>
      )}
      <div
        className={`relative z-40 flex flex-col min-h-screen ${
          isChristmasMode
            ? "christmas-mode"
            : isHalloweenMode
            ? "halloween-mode"
            : ""
        }`}
      >
        <MemoizedTransparentNavbar />
        {!isLoading && !user && renderLandingContent}
        {!isLoading && user && (
          <>
            {!user.isPro && <MemoizedUpgradeBanner />}
            {user.isPro && (
              <div className="absolute top-20 right-4 z-50">
                <Switch.Group>
                  <div className="flex items-center">
                    <Switch.Label className="mr-4 text-white">
                      {useCustomLayout ? "PRO" : "Classic"}
                    </Switch.Label>
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
                  </div>
                </Switch.Group>
              </div>
            )}
            <div className="flex-grow flex flex-col items-center justify-center text-center pb-4">
              {(isChristmasMode || isSimulatingNewYear) && (
                <div className="mb-4 text-white text-2xl font-bold pt-16">
                  <p>Time left until new year: {timeUntilNewYear}</p>
                </div>
              )}
              {user && user.isPro && useCustomLayout ? (
                <MemoizedCustomizableHomePage />
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
                      ? ""
                      : "Upcoming Games"}
                  </h2>
                  {renderGameGrid}
                </motion.div>
              )}
            </div>
          </>
        )}
        <MemoizedFooterLanding />
      </div>
      {showNewYearCelebration && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={2000}
            gravity={0.1}
          />
        </div>
      )}
      {isSimulatingNewYear && countdown === 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
          />
        </div>
      )}
      {isNewYear && (
        <>
          <NewYearCelebration />
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
      <AnimatePresence>
        {showCelebration && (
          <>
            <NewYearCelebration />
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
    </div>
  );
}
