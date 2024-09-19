"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GuidelinesModal({ onAccept }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full text-white overflow-y-auto max-h-[80vh]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center text-blue-300"
      >
        Community Guidelines
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 text-lg"
      >
        <p>
          At Gameboxd, we strive to maintain a respectful and inclusive
          community. Please follow these guidelines when writing reviews and
          interacting with other users:
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          1. Be Respectful
        </h2>
        <p>
          Treat others with respect. Do not use hate speech, discriminatory
          language, or personal attacks. Criticism should be constructive and
          focused on the game, not the developers or other users.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          2. No Spoilers Without Warning
        </h2>
        <p>
          If your review contains spoilers, please use the spoiler tag or give a
          clear warning at the beginning of your review.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          3. Keep It Clean
        </h2>
        <p>
          Avoid excessive profanity or explicit content. While we understand
          that some games may contain mature themes, please keep your language
          appropriate for a general audience.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          4. Stay On Topic
        </h2>
        <p>
          Reviews should be about the game itself. Avoid off-topic discussions
          or using reviews for personal promotions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          5. No Harassment or Bullying
        </h2>
        <p>
          Do not engage in or encourage harassment of any kind. This includes
          targeting specific users, developers, or groups.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          6. Respect Intellectual Property
        </h2>
        <p>
          Do not post copyrighted material without permission. When quoting
          others, give proper credit.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          7. No Self-Promotion
        </h2>
        <p>
          Do not use reviews to promote your own content, products, or services.
          This includes links to your personal websites or social media
          profiles.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          8. No Hate Speech
        </h2>
        <p>
          Do not use hate speech, discriminatory language, or personal attacks.
          Criticism should be constructive and focused on the game, not the
          developers or other users.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          9. Dark Humor
        </h2>
        <p>
          We tolerate black humor, but don&apos;t use it in a way that is
          offensive to others, so keep it in good taste. if we think its not in
          good taste we will remove it.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          10. No Spamming
        </h2>
        <p>
          Do not spam the community with repetitive content. This includes
          excessive use of hashtags, repeated comments, or similar content.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-300">
          11. No Scamming
        </h2>
        <p>
          Do not scam other users. This includes phishing, scams, or any other
          form of deception.
        </p>

        <p className="mt-8">
          Violation of these guidelines may result in content removal or account
          suspension. We appreciate your cooperation in making Gameboxd a
          positive community for all game enthusiasts.
        </p>
      </motion.div>
      <div className="mt-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            onChange={onAccept}
            className="form-checkbox"
          />
          <span className="ml-2 text-gray-200">I accept the guidelines</span>
        </label>
      </div>
    </div>
  );
}
