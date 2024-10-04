"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGamepad,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSkull,
  FaHome,
  FaLayerGroup,
  FaSignOutAlt,
  FaSignInAlt,
  FaUser,
  FaSearch,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import ProBadge from "../common/ProBadge";
import { FiActivity } from "react-icons/fi";
import defaultAvatar from "../../utils/default-image.png";
import { useHalloween } from "../../context/HalloweenContext";
import Tooltip from "@mui/material/Tooltip";

export default function TransparentNavbar() {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuHovered, setIsUserMenuHovered] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();
  const userMenuRef = useRef(null);
  const { isHalloweenMode, toggleHalloweenMode } = useHalloween();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        setIsUserMenuHovered(false);
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
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      setIsMobileMenuOpen(false);
      setIsUserMenuHovered(false);
    } catch (error) {
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  const navItems = [
    { href: "/", text: "Home", icon: <FaHome />, showOnDesktop: false },
    { href: "/all", text: "Games", icon: <FaGamepad />, showOnDesktop: false },
    {
      href: "/profile",
      text: "Profile",
      icon: <FaUser />,
      showOnDesktop: false,
    },
    {
      href: "/activity",
      text: "Activity",
      icon: <FiActivity />,
      showOnDesktop: true,
    },
    {
      href: "/collections",
      text: "Collections",
      icon: <FaLayerGroup />,
      showOnDesktop: false,
    },
  ];

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
          GBXD
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4">
          {userProfile?.isPro && <ProBadge />}
          {user ? (
            <div
              className="relative flex items-center"
              ref={userMenuRef}
              onMouseEnter={() => setIsUserMenuHovered(true)}
              onMouseLeave={() => setIsUserMenuHovered(false)}
            >
              <button className="flex items-center space-x-2 text-white hover:text-blue-400 transition focus:outline-none">
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
                    isUserMenuHovered ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isUserMenuHovered && (
                <>
                  {/* Área invisible para aumentar la "hitbox" */}
                  <div
                    className="absolute top-full left-0 right-0 h-4"
                    onMouseEnter={() => setIsUserMenuHovered(true)}
                  ></div>
                  <div className="absolute right-0 top-full mt-4 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700">
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                      >
                        {item.text}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
              <Tooltip title="Activity" arrow>
                <Link
                  href="/activity"
                  className="ml-4 text-white hover:text-blue-400 transition"
                >
                  <FiActivity size={20} />
                </Link>
              </Tooltip>
            </div>
          ) : (
            <Link
              href="/signin"
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
            >
              Sign In
            </Link>
          )}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "300px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSearch}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search games, users or collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
                />
              </motion.form>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-white hover:text-blue-400 transition"
            aria-label="Toggle search"
          >
            <FaSearch />
          </button>
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/90 backdrop-blur-md"
          >
            <div className="container mx-auto py-4 px-4">
              {user && (
                <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-700">
                  <Image
                    src={userProfile?.photoURL || defaultAvatar}
                    alt={userProfile?.displayName || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">
                      {userProfile?.displayName || "User"}
                    </p>
                    {userProfile?.isPro && <ProBadge />}
                  </div>
                </div>
              )}
              {user &&
                navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-4 py-3 text-white hover:text-blue-400 transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </Link>
                ))}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-4 py-3 text-white hover:text-blue-400 transition w-full"
                >
                  <FaSignOutAlt className="text-xl" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="flex items-center space-x-4 py-3 text-white hover:text-blue-400 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaSignInAlt className="text-xl" />
                  <span>Sign In</span>
                </Link>
              )}
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  placeholder="Search games, users or collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
