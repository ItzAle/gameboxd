"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Inicio de sesión exitoso");
      router.push("/profile");
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      toast.error(
        "Error en el inicio de sesión. Por favor, verifica tus credenciales."
      );
    }
  };

  // Si el usuario ya está autenticado, redirigir al perfil
  if (user) {
    router.push("/profile");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Iniciar sesión
        </h2>
        <form onSubmit={handleSignIn} className="space-y-4">
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
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Iniciar sesión
          </motion.button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-400 hover:underline"
          >
            ¿Has olvidado la contraseña?
          </Link>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
