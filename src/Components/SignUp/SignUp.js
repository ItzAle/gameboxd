"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../../src/context/AuthContext";
import GuidelinesModal from "../GuidelinesModal/GuidelinesModal";
import Modal from "react-modal"; // Import Modal component

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [guidelinesRead, setGuidelinesRead] = useState(false);

  if (user) {
    router.push("/profile");
    return null;
  }

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9]{3,10}[^.]$/;
    return (
      regex.test(username) && !username.includes("_") && !username.includes(" ")
    );
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d.*\d)/;
    return regex.test(password);
  };

  const checkUsernameExists = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleUsernameChange = async (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (!validateUsername(newUsername)) {
      setUsernameError(
        "The username must be no longer than 10 characters, must be at least 4 characters long, must not end in a period and must not contain '_' or spaces."
      );
    } else {
      const usernameExists = await checkUsernameExists(newUsername);
      if (usernameExists) {
        setUsernameError("This username is already in use.");
      } else {
        setUsernameError("");
      }
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!validatePassword(newPassword)) {
      setPasswordError(
        "The password must contain at least one capital letter and two numbers."
      );
    } else {
      setPasswordError("");
    }
    // Password strength logic
    if (newPassword.length < 6) {
      setPasswordStrength("Weak");
    } else if (newPassword.length < 10) {
      setPasswordStrength("Medium");
    } else {
      setPasswordStrength("Strong");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const checkEmailExists = async (email) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleEmailChange = async (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      const emailExists = await checkEmailExists(newEmail);
      if (emailExists) {
        setEmailError("This email is already registered.");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setGuidelinesRead(true);
  };

  const handleGuidelinesAcceptance = () => {
    setGuidelinesAccepted(!guidelinesAccepted);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (usernameError || passwordError || emailError || !guidelinesAccepted) {
      toast.error(
        "Please correct any errors and accept the guidelines before registering."
      );
      return;
    }

    try {
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        toast.error(
          "This username is already in use. Please choose another one."
        );
        return;
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError("This email is already registered.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username,
        bio: "",
        reviews: [],
        likedGames: [],
        followers: [],
        following: [],
        emailVerified: false,
        isPro: false,
      });

      console.log("Datos del usuario guardados:", {
        email: user.email,
        username: username,
      });

      toast.success("Registration successful. Please verify your email.");
      router.push("/email-verification");
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error("Error registering. Please try again.");
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case "Weak":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Strong":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-md bg-white bg-opacity-10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white border-opacity-20"
      >
        <h2 className="text-4xl font-bold mb-6 text-center text-white">
          Register
        </h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-200"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="Your Username"
              required
            />
            {usernameError && (
              <p className="text-red-400 text-xs mt-1">{usernameError}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-200"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="your@email.com"
              required
            />
            {emailError && (
              <div className="text-red-400 text-xs mt-1">
                {emailError}{" "}
                <Link href="/signin" className="text-blue-300 hover:underline">
                  Do you want to sign in?
                </Link>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="block w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <svg
                    className="h-6 w-6 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-400 text-xs mt-1">{passwordError}</p>
            )}
            <div className="mt-1 flex items-center">
              <div
                className={`h-2 flex-1 rounded ${getPasswordStrengthColor(
                  passwordStrength
                )}`}
              ></div>
              <p className="text-xs ml-2 text-gray-400">{passwordStrength}</p>
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={openModal}
              className="text-blue-300 hover:underline"
            >
              Read Guidelines
            </button>
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={guidelinesAccepted}
                  onChange={handleGuidelinesAcceptance}
                  className="form-checkbox"
                  disabled={!guidelinesRead}
                />
                <span className="ml-2 text-gray-200">
                  I accept the guidelines
                </span>
              </label>
              {!guidelinesRead && (
                <p className="text-red-400 text-xs mt-1">
                  Please read the guidelines before accepting
                </p>
              )}
            </div>
            <Modal
              isOpen={isModalOpen}
              onRequestClose={closeModal}
              contentLabel="Guidelines Modal"
              className="fixed inset-0 flex items-center justify-center z-50"
              overlayClassName="fixed inset-0 bg-black bg-opacity-75"
            >
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full overflow-y-auto max-h-[80vh]">
                <GuidelinesModal />
                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md w-full"
                >
                  Close
                </button>
              </div>
            </Modal>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-200"
            disabled={
              usernameError ||
              passwordError ||
              emailError ||
              !guidelinesAccepted ||
              !guidelinesRead
            }
          >
            Register
          </motion.button>
          {(!guidelinesRead || !guidelinesAccepted) && (
            <p className="text-red-400 text-xs mt-1">
              Please read and accept the guidelines before registering
            </p>
          )}
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
