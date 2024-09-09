"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

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
      }, 5000); // Comprueba cada 5 segundos

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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Verify your email
        </h2>
        <p className="mb-4 text-center">
          A verification email has been sent to your email address. Please
          verify your email address and follow the instructions.
        </p>
        <button
          onClick={handleResendVerification}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Resend verification email
        </button>
      </div>
    </div>
  );
}
