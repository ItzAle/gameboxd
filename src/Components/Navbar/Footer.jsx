"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";
import { RiThreadsLine } from "react-icons/ri";
import { useAuth } from "../../context/AuthContext"; // Asegúrate de importar useAuth

export default function Footer() {
  const { user } = useAuth(); // Obtén la información del usuario

  return (
    <motion.footer
      className="bg-transparent text-white py-2 absolute bottom-0 left-0 right-0 backdrop-blur-md"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Footer links */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-3 mb-2 md:mb-0">
            <Link
              href="/about"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              Privacy Policy
            </Link>
            <Link
              href="/guidelines"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              Guidelines
            </Link>
            {/* Mostrar el enlace PRO solo si el usuario no es PRO */}
            {(!user || !user.isPro) && (
              <Link
                href="/pro"
                className="text-white hover:text-blue-400 transition text-xs"
              >
                PRO
              </Link>
            )}
            <Link
              href="https://api.gameboxd.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              API
            </Link>
          </div>

          {/* Social media icons */}
          <div className="flex space-x-3 mt-2 md:mt-0">
            <a
              href="https://x.com/gameboxdapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <FaTwitter size={16} />
            </a>
            <a
              href="https://www.instagram.com/gameboxdapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@gameboxdapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <FaTiktok size={16} />
            </a>
            <a
              href="https://www.threads.net/@gameboxdapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <RiThreadsLine size={16} />
            </a>
          </div>
        </div>

        <div className="text-center text-white text-xs mt-1">
          <p>© {new Date().getFullYear()} Gameboxd. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
