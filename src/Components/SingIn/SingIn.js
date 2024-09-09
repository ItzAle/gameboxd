"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

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
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}
