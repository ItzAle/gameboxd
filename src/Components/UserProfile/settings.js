"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { toast } from "react-toastify";
import AvatarCropper from "../AvatarCropper/AvatarCropper";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaImage, FaCog, FaCrown } from "react-icons/fa";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { Loader } from "lucide-react";
import { format, addMonths, isBefore } from "date-fns";
import { getUsernameStyle } from "../../utils/usernameStyles";

const tabs = ["PROFILE", "SECURITY", "AVATAR", "PRO"];

export default function ProfileSettings() {
  const { user } = useAuth();
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [userData, setUserData] = useState({
    username: "",
    givenName: "",
    familyName: "",
    email: "",
    location: "",
    bio: "",
    pronoun: "",
    isPro: false,
  });
  const [profilePicture, setProfilePicture] = useState("");
  const [image, setImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pronounExample, setPronounExample] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [lastUsernameChange, setLastUsernameChange] = useState(null);
  const [canChangeUsername, setCanChangeUsername] = useState(false);
  const [nextChangeDate, setNextChangeDate] = useState(null);
  const [nameEffect, setNameEffect] = useState("none");
  const [nameColor, setNameColor] = useState("#FFFFFF");
  const [effectIntensity, setEffectIntensity] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setNameEffect(data.nameEffect || "none");
            setNameColor(data.nameColor || "#FFFFFF");
            setEffectIntensity(data.effectIntensity || 1);
          }
        } catch (error) {
          toast.error("Error al cargar los datos del usuario");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (lastUsernameChange) {
      const nextDate = addMonths(lastUsernameChange, 3);
      setNextChangeDate(nextDate);
      setCanChangeUsername(isBefore(nextDate, new Date()));
    } else {
      setCanChangeUsername(true);
    }
  }, [lastUsernameChange]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePronounChange = useCallback((e) => {
    const value = e.target.value;
    setUserData((prev) => ({ ...prev, pronoun: value }));

    switch (value) {
      case "they/their":
        setPronounExample(
          "They are a gamer. I gave them the controller. That game is theirs."
        );
        break;
      case "he/his":
        setPronounExample(
          "He is a gamer. I gave him the controller. That game is his."
        );
        break;
      case "he/their":
        setPronounExample(
          "He is a gamer. I gave them the controller. That game is theirs."
        );
        break;
      case "she/her":
        setPronounExample(
          "She is a gamer. I gave her the controller. That game is hers."
        );
        break;
      case "she/their":
        setPronounExample(
          "She is a gamer. I gave them the controller. That game is theirs."
        );
        break;
      case "xe/xyr":
        setPronounExample(
          "Xe is a gamer. I gave xem the controller. That game is xyrs."
        );
        break;
      case "ze/hir":
        setPronounExample(
          "Ze is a gamer. I gave hir the controller. That game is hirs."
        );
        break;
      case "ze/zir":
        setPronounExample(
          "Ze is a gamer. I gave zir the controller. That game is zirs."
        );
        break;
      case "it/its":
        setPronounExample(
          "It is a gamer. I gave it the controller. That game is its."
        );
        break;
      default:
        setPronounExample("");
    }
  }, []);

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9]{3,10}[^.]$/;
    return (
      regex.test(username) && !username.includes("_") && !username.includes(" ")
    );
  };

  const checkUsernameExists = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleUsernameChange = useCallback(
    async (e) => {
      const newUsername = e.target.value;
      setUserData((prev) => ({ ...prev, username: newUsername }));

      if (!canChangeUsername) {
        setUsernameError(
          `You can change your username again on ${format(
            nextChangeDate,
            "MMMM d, yyyy"
          )}`
        );
        return;
      }

      if (!validateUsername(newUsername)) {
        setUsernameError(
          "The username must be 3-10 characters long, must not end in a period, and must not contain '_' or spaces."
        );
      } else {
        const usernameExists = await checkUsernameExists(newUsername);
        if (usernameExists && newUsername !== userData.username) {
          setUsernameError("This username is already in use.");
        } else {
          setUsernameError("");
        }
      }
    },
    [userData.username, canChangeUsername, nextChangeDate]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (usernameError) {
        toast.error("Please correct the username error before saving.");
        return;
      }
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const updates = { ...userData };
          if (userData.username !== user.displayName) {
            updates.lastUsernameChange = new Date().toISOString();
          }
          await updateDoc(userRef, updates);
          setLastUsernameChange(new Date());
          toast.success("Profile updated successfully");
        } catch (error) {
          toast.error("Failed to update profile");
        }
      }
    },
    [user, userData, usernameError]
  );

  const handlePasswordReset = useCallback(async () => {
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        toast.success("Password reset email sent. Please check your inbox.");
      } catch (error) {
        toast.error("Failed to send password reset email. Please try again.");
      }
    }
  }, [user, auth]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCropperSave = useCallback(
    async (croppedImage) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { profilePicture: croppedImage });
          setProfilePicture(croppedImage);
          setShowCropper(false);
          toast.success("Avatar updated successfully");
        } catch (error) {
          toast.error("Failed to update avatar");
        }
      }
    },
    [user]
  );

  const handleCropperCancel = useCallback(() => {
    setShowCropper(false);
    setImage(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Settings</h1>
          <div className="mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`mr-4 pb-2 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500"
                    : "text-gray-400"
                } ${userData.isPro && tab === "PRO" ? "text-gold" : ""}`}
              >
                {tab === "PROFILE" && <FaUser className="inline mr-2" />}
                {tab === "SECURITY" && <FaLock className="inline mr-2" />}
                {tab === "AVATAR" && <FaImage className="inline mr-2" />}
                {tab === "PRO" && <FaCrown className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "PROFILE" && (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6 bg-gray-800 rounded-lg p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <label htmlFor="username" className="block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={userData.username}
                  onChange={handleUsernameChange}
                  className={`w-full bg-gray-700 rounded px-3 py-2 ${
                    (!userData.isPro || !canChangeUsername) &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!userData.isPro || !canChangeUsername}
                />
                {usernameError && (
                  <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                )}
                {!userData.isPro && (
                  <p className="mt-2 text-sm text-yellow-500">
                    Only PRO users can change their username.
                    <Link
                      href="/upgrade"
                      className="ml-1 text-blue-400 hover:underline"
                    >
                      Upgrade to PRO
                    </Link>
                  </p>
                )}
                {userData.isPro && !canChangeUsername && (
                  <p className="mt-2 text-sm text-yellow-500">
                    You can change your username again on{" "}
                    {format(nextChangeDate, "MMMM d, yyyy")}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="givenName" className="block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="givenName"
                  name="givenName"
                  value={userData.givenName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="familyName" className="block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="familyName"
                  name="familyName"
                  value={userData.familyName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="location" className="block mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={userData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="bio" className="block mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded px-3 py-2"
                  rows="4"
                ></textarea>
              </div>
              <div>
                <label htmlFor="pronoun" className="block mb-2">
                  Pronoun
                </label>
                <select
                  id="pronoun"
                  name="pronoun"
                  value={userData.pronoun}
                  onChange={handlePronounChange}
                  className="w-full bg-gray-700 rounded px-3 py-2 mb-2"
                >
                  <option value="">Select a pronoun</option>
                  <option value="they/their">They/Their</option>
                  <option value="he/his">He/His</option>
                  <option value="he/their">He/Their</option>
                  <option value="she/her">She/Her</option>
                  <option value="she/their">She/Their</option>
                  <option value="xe/xyr">Xe/Xyr</option>
                  <option value="ze/hir">Ze/Hir</option>
                  <option value="ze/zir">Ze/Zir</option>
                  <option value="it/its">It/Its</option>
                </select>
                {pronounExample && (
                  <p className="text-sm text-gray-400 mt-2">
                    Example: {pronounExample}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
              >
                Save Changes
              </button>
            </motion.form>
          )}

          {activeTab === "SECURITY" && (
            <motion.div
              className="space-y-6 bg-gray-800 rounded-lg p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <button
                  onClick={handlePasswordReset}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
                >
                  Send Password Reset Email
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "AVATAR" && (
            <motion.div
              className="space-y-6 bg-gray-800 rounded-lg p-6 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Change Avatar</h2>
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-4 w-full max-w-xs"
                />
                {profilePicture && (
                  <div className="mb-4 w-full max-w-xs">
                    <img
                      src={profilePicture}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full mx-auto"
                    />
                  </div>
                )}
                {showCropper && (
                  <div className="w-full max-w-md overflow-hidden">
                    <AvatarCropper
                      image={image}
                      onSave={handleCropperSave}
                      onCancel={handleCropperCancel}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "PRO" && (
            <motion.div
              className="space-y-6 bg-gray-800 rounded-lg p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4">Opciones PRO</h2>
              {userData.isPro ? (
                <>
                  <div>
                    <label htmlFor="nameEffect" className="block mb-2">
                      Efecto del nombre de usuario
                    </label>
                    <select
                      id="nameEffect"
                      value={nameEffect}
                      onChange={(e) => setNameEffect(e.target.value)}
                      className="w-full bg-gray-700 rounded px-3 py-2"
                    >
                      <option value="none">Ninguno</option>
                      <option value="glow">Brillo</option>
                      <option value="shadow">Sombra</option>
                      <option value="neon">Neón</option>
                      <option value="outline">Contorno</option>
                      <option value="retro">Retro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nameColor" className="block mb-2">
                      Color del nombre de usuario
                    </label>
                    <input
                      type="color"
                      id="nameColor"
                      value={nameColor}
                      onChange={(e) => setNameColor(e.target.value)}
                      className="w-full bg-gray-700 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="effectIntensity" className="block mb-2">
                      Intensidad del efecto
                    </label>
                    <input
                      type="range"
                      id="effectIntensity"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={effectIntensity}
                      onChange={(e) =>
                        setEffectIntensity(parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vista previa</h3>
                    <div className="bg-gray-900 p-4 rounded">
                      <span
                        style={getUsernameStyle(
                          nameEffect,
                          nameColor,
                          effectIntensity
                        )}
                      >
                        {userData.username}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, "users", user.uid), {
                          nameEffect,
                          nameColor,
                          effectIntensity,
                        });
                        toast.success("Opciones PRO actualizadas");
                      } catch (error) {
                        toast.error("Error al actualizar las opciones PRO");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
                  >
                    Guardar cambios
                  </button>
                </>
              ) : (
                <p className="text-yellow-500">
                  Actualiza a PRO para acceder a características exclusivas.
                  <Link
                    href="/upgrade"
                    className="ml-2 text-blue-400 hover:underline"
                  >
                    Actualizar a PRO
                  </Link>
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
