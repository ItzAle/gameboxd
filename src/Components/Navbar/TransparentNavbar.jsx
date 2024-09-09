"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaSignOutAlt,
  FaGamepad,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { SiGoogledocs } from "react-icons/si";

export default function TransparentNavbar() {
  const { user } = useAuth(); // Usa useAuth en lugar de useSession
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      closeMobileMenu();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navItems = [
    { href: "/all", icon: <FaGamepad />, text: "All Games" },
    ...(user
      ? [
          { href: "/profile", icon: <FaUser />, text: "Profile" },
          {
            href: "https://gbxd-api.vercel.app/",
            icon: <SiGoogledocs />,
            text: "API",
          },
          {
            href: "#",
            icon: <FaSignOutAlt />,
            text: "Sign Out",
            onClick: handleSignOut,
          },
        ]
      : [
          {
            href: "/signin",
            text: "Login",
            className:
              "bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition",
          },
        ]),
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled ? "bg-gray-900/80 backdrop-blur-sm" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`text-white hover:text-blue-400 transition flex items-center ${
                  item.className || ""
                }`}
                onClick={item.onClick}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.text}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Spacer for mobile */}
      <div className="h-16 md:h-0"></div>

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
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`block py-4 text-white text-2xl font-semibold hover:text-blue-400 transition ${
                    item.className || ""
                  }`}
                  onClick={() => {
                    closeMobileMenu();
                    item.onClick && item.onClick();
                  }}
                >
                  <span className="flex items-center">
                    {item.icon && (
                      <span className="mr-4 text-3xl">{item.icon}</span>
                    )}
                    {item.text}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
