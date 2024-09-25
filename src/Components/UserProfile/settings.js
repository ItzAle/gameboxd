"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import TransparentNavbar from "../Navbar/TransparentNavbar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import AvatarCropper from "../AvatarCropper/AvatarCropper";

const tabs = ["PROFILE", "AUTH", "AVATAR"];

export default function ProfileSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [userData, setUserData] = useState({
    username: "",
    givenName: "",
    familyName: "",
    email: "",
    location: "",
    website: "",
    bio: "",
    pronoun: "",
    posters: "",
  });
  const [profilePicture, setProfilePicture] = useState("");
  const [image, setImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setProfilePicture(userDoc.data().profilePicture || "");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
          toast.error("Error al cargar los datos del perfil");
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, userData);
          toast.success("Perfil actualizado con éxito");
        } catch (error) {
          console.error("Error al actualizar el perfil:", error);
          toast.error("Error al actualizar el perfil: " + error.message);
        }
      }
    },
    [user, userData]
  );

  const handlePasswordReset = useCallback(async () => {
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        toast.success("Se ha enviado un correo para restablecer tu contraseña");
      } catch (error) {
        console.error(
          "Error al enviar el correo de restablecimiento de contraseña:",
          error
        );
        toast.error(
          "Error al enviar el correo de restablecimiento de contraseña"
        );
      }
    }
  }, [user]);

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
    async (base64Image) => {
      if (user) {
        try {
          // Actualizar el perfil del usuario con la nueva imagen en base64
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { profilePicture: base64Image });

          setProfilePicture(base64Image);
          setShowCropper(false);
          toast.success("Avatar actualizado con éxito");
        } catch (error) {
          console.error("Error al actualizar el avatar:", error);
          toast.error("Error al actualizar el avatar");
        }
      }
    },
    [user]
  );

  const handleCropperCancel = useCallback(() => {
    setShowCropper(false);
    setImage(null);
  }, []);

  // Renderizado condicional
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  const renderProfileTab = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          name="username"
          value={userData.username}
          onChange={handleInputChange}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          disabled={!user || !user.isPro} // Añadimos una comprobación para user
        />
        {(!user || !user.isPro) && (
          <p className="text-sm text-gray-400 mt-1">
            Solo los usuarios PRO pueden cambiar su username.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="givenName"
            className="block text-sm font-medium text-gray-300"
          >
            Given name
          </label>
          <input
            type="text"
            id="givenName"
            name="givenName"
            value={userData.givenName}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          />
        </div>
        <div>
          <label
            htmlFor="familyName"
            className="block text-sm font-medium text-gray-300"
          >
            Family name
          </label>
          <input
            type="text"
            id="familyName"
            name="familyName"
            value={userData.familyName}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={userData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-300"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={userData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          />
        </div>
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-300"
          >
            Website
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={userData.website}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-300"
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={userData.bio}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
        ></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="pronoun"
            className="block text-sm font-medium text-gray-300"
          >
            Pronoun
          </label>
          <select
            id="pronoun"
            name="pronoun"
            value={userData.pronoun}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          >
            <option value="He/his">He/his</option>
            <option value="She/her">She/her</option>
            <option value="They/them">They/them</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="posters"
            className="block text-sm font-medium text-gray-300"
          >
            Posters
          </label>
          <select
            id="posters"
            name="posters"
            value={userData.posters}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white"
          >
            <option value="Any">Any</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );

  const renderAuthTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Change Password</h2>
      <button
        onClick={handlePasswordReset}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
      >
        Send Password Reset Email
      </button>
    </div>
  );

  const renderAvatarTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Avatar</h2>
      {profilePicture && (
        <img
          src={profilePicture}
          alt="Current Avatar"
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />
      )}
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
        id="avatar-upload"
      />
      <label
        htmlFor="avatar-upload"
        className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer"
      >
        Seleccionar nueva imagen
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <div className="mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-4 py-2 px-4 rounded-t-lg ${
                activeTab === tab
                  ? "bg-gray-800 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          {activeTab === "PROFILE" && renderProfileTab()}
          {activeTab === "AUTH" && renderAuthTab()}
          {activeTab === "AVATAR" && renderAvatarTab()}
        </div>
      </div>
      {showCropper && (
        <AvatarCropper
          image={image}
          onSave={handleCropperSave}
          onCancel={handleCropperCancel}
        />
      )}
    </div>
  );
}
