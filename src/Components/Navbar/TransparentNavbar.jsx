"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaGamepad, FaBars, FaTimes, FaChevronDown, FaSkull } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import ProBadge from "../common/ProBadge";
import { FiActivity } from "react-icons/fi";
import defaultAvatar from "../../utils/default-image.png";
import { useHalloween } from '../../context/HalloweenContext';

export default function TransparentNavbar() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();
  const userMenuRef = useRef(null);
  const { isHalloweenMode, toggleHalloweenMode } = useHalloween();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile({
          ...userData,
          id: user.uid,
          displayName: userData.username || user.displayName,
          photoURL: userData.profilePicture || user.photoURL,
        });
      } else {
        setUserProfile({
          id: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }
    } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navItems = [
    ...(user
      ? [
          {
            href: "/activity",
            icon: (
              <FiActivity className="text-white hover:text-blue-400 transition" />
            ),
            text: "Activity",
            tooltip: "Activity",
          },
        ]
      : []),
    { href: "/all", text: "Games" },
  ];

  const authButton = user ? null : (
    <Link
      href="/signin"
      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
    >
      Sign In
    </Link>
  );

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/30 backdrop-blur-md"
          : "bg-transparent backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-blue-400 transition"
        >
          <span className="hidden md:inline">GBXD</span>
          <span className="md:hidden">GBXD</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          {userProfile?.isPro && <ProBadge />}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-blue-400 transition focus:outline-none"
              >
                <Image
                  src={userProfile?.photoURL || defaultAvatar}
                  alt={userProfile?.displayName || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{userProfile?.displayName || "User"}</span>
                <FaChevronDown
                  className={`transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Home
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/all"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Games
                  </Link>
                  <Link
                    href="/collections"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Collections
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          {navItems.map((item, index) => (
            <div key={index} className="relative group">
              {item.icon ? (
                <Link
                  href={item.href}
                  className="flex items-center text-white hover:text-blue-400 transition"
                >
                  {item.icon}
                  {item.tooltip && (
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.tooltip}
                    </span>
                  )}
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={`text-white hover:text-blue-400 transition flex items-center ${
                    item.className || ""
                  }`}
                  onClick={item.onClick}
                >
                  {item.text}
                </Link>
              )}
            </div>
          ))}
          {authButton}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-900/95 backdrop-blur-sm md:hidden"
          >
            <div className="container mx-auto py-4 px-4 h-full flex flex-col justify-center">
              {user ? (
                <>
                  <Link
                    href="/"
                    className="block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition"
                  >
                    Home
                  </Link>
                  <Link
                    href="/collections"
                    className="block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition"
                  >
                    Collections
                  </Link>
                  <Link
                    href="/profile"
                    className="block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition"
                  >
                    Profile
                  </Link>
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={`block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition ${
                        item.className || ""
                      }`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        item.onClick && item.onClick();
                      }}
                    >
                      <span className="flex items-center">
                        {item.icon && (
                          <span className="mr-4 text-3xl">{item.icon}</span>
                        )}
                        {item.text || item.tooltip}
                      </span>
                    </Link>
                  ))}
                  <button
                    onClick={handleSignOut}
                    className="block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}