"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaTwitter, FaGithub } from "react-icons/fa";

export default function Footer() {
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
              href="/privacy"
              className="text-white hover:text-blue-400 transition text-xs"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Social media icons */}
          <div className="flex space-x-3 mt-2 md:mt-0">
            <a
              href="https://x.com/alehhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <FaTwitter size={16} />
            </a>
            <a
              href="https://github.com/ItzAle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-400 transition"
            >
              <FaGithub size={16} />
            </a>
          </div>
        </div>

        {/* Copyright text */}
        <div className="text-center text-white text-xs mt-1">
          <p>© {new Date().getFullYear()} Gameboxd. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
