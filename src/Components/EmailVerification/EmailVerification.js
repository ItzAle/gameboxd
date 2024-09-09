"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { sendEmailVerification } from "firebase/auth";

export default function EmailVerification() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const checkEmailVerified = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkEmailVerified);
          toast.success("Email verified successfully.");
          router.push("/profile");
        }
      }, 5000); // Checks every 5 seconds

      return () => clearInterval(checkEmailVerified);
    }
  }, [user, router]);

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(user);
      toast.info("A verification email has been sent to your email address.");
    } catch (error) {
      toast.error("Error resending verification email. Please try again.");
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
