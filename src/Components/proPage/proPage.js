"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TransparentNavbar from "@/Components/Navbar/TransparentNavbar";
import ProBadge from "@/Components/common/ProBadge";

export default function ProPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-12 text-center text-blue-300">
          Unlock the Power of PRO 🚀
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.emoji}</div>
              <h2 className="text-2xl font-semibold mb-2 text-blue-300">
                {feature.title}
              </h2>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="/upgrade">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-blue-700 transition duration-300"
            >
              Upgrade to PRO Now! 💎
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

const proFeatures = [
  {
    emoji: "🎨",
    title: "Custom Username Styles",
    description: "Stand out with unique colors and effects for your username.",
  },
  {
    emoji: "📊",
    title: "Advanced Statistics",
    description:
      "Gain deeper insights into your gaming habits and preferences.",
  },
  {
    emoji: "🏆",
    title: "Exclusive Badges",
    description: (
      <div>
        Show off your PRO status with special profile badges.
        <div className="mt-2 flex items-center">
          Example: <ProBadge className="ml-2" />
        </div>
      </div>
    ),
  },
  {
    emoji: "🔔",
    title: "Priority Notifications",
    description: "Be the first to know about new game releases and updates.",
  },
  {
    emoji: "💬",
    title: "Extended Reviews",
    description:
      "Write longer, more detailed reviews to share your experiences.",
  },
  {
    emoji: "🎮",
    title: "Early Access",
    description: "Get early access to new features and improvements.",
  },
];
