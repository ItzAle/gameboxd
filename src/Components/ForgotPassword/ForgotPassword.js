"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(
        "Se ha enviado un correo electrónico para restablecer tu contraseña."
      );
      router.push("/signin"); // Redirige al usuario a la página de inicio de sesión
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      toast.error(
        "Error al enviar el correo de restablecimiento. Por favor, verifica tu correo electrónico."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Restablecer contraseña
        </h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar correo de restablecimiento"}
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/signin"
            className="text-sm text-blue-400 hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
