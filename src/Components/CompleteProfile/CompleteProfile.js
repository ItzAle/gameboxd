"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function CompleteProfile() {
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("No user found. Please sign in again.");
      return;
    }

    try {
      let photoURL = user.photoURL;

      if (photo) {
        console.log("Preparing to upload photo");
        if (!storage) {
          console.error("Storage is not initialized");
          toast.error("Error: Storage is not initialized");
          return;
        }
        
        try {
          const photoRef = ref(storage, `profilePhotos/${user.uid}`);
          console.log("Photo reference created:", photoRef);
          
          if (!photoRef || !photoRef.fullPath) {
            console.error("Invalid storage reference");
            toast.error("Error: Invalid storage reference");
            return;
          }
          
          console.log("Uploading photo...");
          const snapshot = await uploadBytes(photoRef, photo);
          console.log("Upload completed:", snapshot);
          
          photoURL = await getDownloadURL(snapshot.ref);
          console.log("Photo URL obtained:", photoURL);
        } catch (uploadError) {
          console.error("Error during photo upload:", uploadError);
          toast.error(`Error uploading photo: ${uploadError.message}`);
          return;
        }
      }

      console.log("Updating user profile");
      await updateProfile(user, { photoURL });
      
      console.log("Updating Firestore document");
      if (!db) {
        console.error("Firestore is not initialized");
        toast.error("Error: Firestore is not initialized");
        return;
      }
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        bio,
        photoURL,
      });

      console.log("Profile updated successfully");
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(`Error updating profile: ${error.message}`);
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
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-300"
            >
              Tell us about yourself
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="I'm a gamer who loves..."
            />
          </div>
          <div>
            <label
              htmlFor="photo"
              className="block text-sm font-medium text-gray-300"
            >
              Profile Photo
            </label>
            <input
              type="file"
              id="photo"
              onChange={handlePhotoChange}
              className="mt-1 block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Complete Profile
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
