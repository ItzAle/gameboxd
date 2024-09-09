"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
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

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push("/profile");
    return null;
  }

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9]{4,10}[^.]$/;
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
        "The username must be no longer than 10 characters, must be at least 4 characters long, must not end in a period and must not contain “_” or spaces.s must not end in a period, and must not contain '_' or spaces."
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (usernameError || passwordError || emailError) {
      toast.error("Please correct any errors before registering.");
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
        emailVerified: false,
      });

      toast.success("Registration successful. Please verify your email.");
      router.push("/email-verification");
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error("Error registering. Please try again.");
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
          Register
        </h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Username"
              required
            />
            {usernameError && (
              <p className="text-red-500 text-xs mt-1">{usernameError}</p>
            )}
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
              onChange={handleEmailChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
            {emailError && (
              <div className="text-red-500 text-xs mt-1">
                {emailError}{" "}
                <Link href="/signin" className="text-blue-400 hover:underline">
                  Do you want to sign in?
                </Link>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            disabled={usernameError || passwordError || emailError}
          >
            Register
          </motion.button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/signin" className="text-blue-400 hover:underline">
              Already have an account?
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
