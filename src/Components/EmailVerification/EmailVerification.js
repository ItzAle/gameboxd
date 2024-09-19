"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { sendEmailVerification, reload, getAuth } from "firebase/auth";

export default function EmailVerification() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.error("No se pudo obtener el usuario de Firebase");
        return;
      }

      const checkEmailVerified = setInterval(async () => {
        try {
          await reload(firebaseUser);
          if (firebaseUser.emailVerified) {
            clearInterval(checkEmailVerified);
            toast.success("Correo electrónico verificado con éxito.");
            router.push("/profile");
          }
        } catch (error) {
          console.error("Error al recargar el usuario:", error);
        }
      }, 5000); // Verifica cada 5 segundos

      return () => clearInterval(checkEmailVerified);
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      toast.error("No se pudo obtener el usuario actual. Por favor, inténtalo de nuevo.");
      return;
    }

    try {
      await sendEmailVerification(firebaseUser);
      toast.info("Se ha enviado un correo de verificación a tu dirección de email.");
    } catch (error) {
      toast.error("Error al reenviar el correo de verificación. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-md bg-white bg-opacity-10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white border-opacity-20 text-white"
      >
        <h2 className="text-4xl font-bold mb-6 text-center">
          Verify your email
        </h2>
        <p className="mb-6 text-center text-gray-200">
          A verification email has been sent to your email address. Please
          verify your email address and follow the instructions.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResendVerification}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200"
        >
          Resend verification email
        </motion.button>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Didn&apos;t receive the email? Check your spam folder or click the
            button above to resend.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
