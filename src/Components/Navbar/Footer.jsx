"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer
      className="bg-transparent text-white py-6 absolute bottom-0 left-0 right-0 backdrop-blur-md"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
        {/* Footer Links */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <Link href="/" className="text-white hover:text-blue-400 transition">
            Home
          </Link>
          <Link
            href="/about"
            className="text-white hover:text-blue-400 transition"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-blue-400 transition"
          >
            Contact
          </Link>
        </div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a
            href="https://facebook.com"
            className="text-white hover:text-blue-400 transition"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com"
            className="text-white hover:text-blue-400 transition"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://instagram.com"
            className="text-white hover:text-blue-400 transition"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://github.com"
            className="text-white hover:text-blue-400 transition"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="text-center text-white text-sm mt-4">
        <p>© {new Date().getFullYear()} Gameboxd. All rights reserved.</p>
      </div>
    </motion.footer>
  );
}
