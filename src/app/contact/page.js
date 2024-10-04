"use client";
import React, { useState } from "react";
import TransparentNavbar from "../../Components/Navbar/TransparentNavbar";
import { FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";
import { toast } from "react-toastify";
import { db } from "../../../lib/firebase"; // Asegúrate de que la ruta sea correcta
import { collection, addDoc } from "firebase/firestore";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("suggestion");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Crear un objeto con los datos del formulario
      const feedbackData = {
        name,
        email,
        message,
        type,
        createdAt: new Date(),
      };

      // Añadir el documento a la colección 'feedback' en Firestore
      await addDoc(collection(db, "feedback"), feedbackData);

      // Mostrar mensaje de éxito
      toast.success("Thank you for your feedback!");

      // Limpiar el formulario
      setName("");
      setEmail("");
      setMessage("");
      setType("suggestion");
    } catch (error) {

      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <p className="text-lg">Connect with us on social media:</p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://x.com/gameboxdapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-blue-400 transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="https://instagram.com/gameboxdapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-blue-400 transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@gameboxdapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-blue-400 transition-colors"
              >
                <FaTiktok />
              </a>
            </div>
            <p>Or send us an email:</p>
            <a href="mailto:support@gameboxd.me">support@gameboxd.me</a>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Send us your feedback
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-300"
                >
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="account">Account Issue</option>
                  <option value="performance">Performance Problem</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="data_issue">Data Accuracy Issue</option>
                  <option value="ui_ux">UI/UX Feedback</option>
                  <option value="security">Security Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
