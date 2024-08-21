"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import jsonp from "jsonp";
import { createUserProfile } from "../../../lib/firebase";

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  onSave,
  setBio,
  setProfilePicture,
  bio,
  profilePicture,
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Profile Picture URL
          </label>
          <input
            type="text"
            placeholder="Profile Picture URL"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [covers, setCovers] = useState({});
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const user = session?.user;
  const apiUrl = "https://www.giantbomb.com/api/games/";

  useEffect(() => {
    if (session?.user) {
      createUserProfile(session.user);
    }
  }, [session]);

  const fetchGameById = (gameId) => {
    return new Promise((resolve, reject) => {
      const params = {
        api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
        format: "jsonp",
        json_callback: "jsonpCallback",
        filter: `id:${gameId}`,
      };

      const urlParams = new URLSearchParams(params).toString();
      const apiUrlWithParams = `${apiUrl}?${urlParams}`;

      jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
        if (err) {
          console.error("Error fetching game data:", err);
          reject(err);
        } else {
          resolve(data.results[0]);
        }
      });
    });
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          setBio(userData.bio || "");
          setProfilePicture(userData.profilePicture || "");

          // Obtener las carátulas de los juegos
          const newCovers = {};
          for (const game of userData.likedGames) {
            if (game.gameId) {
              try {
                const gameData = await fetchGameById(game.gameId);
                newCovers[game.gameId] = gameData.image.medium_url;
              } catch (error) {
                console.error(
                  `Error fetching cover for game ${game.gameId}:`,
                  error
                );
              }
            }
          }
          setCovers(newCovers);
        } else {
          setUserProfile({ likedGames: [], reviews: [] });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // Update user profile
      const userRef = doc(db, "users", user.email);
      batch.update(userRef, {
        bio,
        profilePicture,
      });

      await batch.commit();

      // Actualizar el userProfile local después de guardar
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        bio,
        profilePicture,
      }));

      setEditing(false);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setBio(userProfile.bio || "");
      setProfilePicture(userProfile.profilePicture || "");
    }
    setEditing(true);
  };

  if (!user) {
    return <p className="text-red-500">Please log in to view your profile.</p>;
  }

  if (!userProfile) {
    return <p className="text-blue-500">Loading profile...</p>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8 animate-fade-in">
        Welcome, {user.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            {/* Profile Picture */}
            <div className="mb-4 flex flex-col items-center">
              <img
                src={profilePicture || "/path/to/default-profile-pic.png"}
                alt="Profile Picture"
                className="w-32 h-32 object-cover rounded-full shadow-lg"
              />
            </div>

            {/* Bio */}
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Bio</h2>
              <p className="text-lg">{bio || "No bio available."}</p>
            </div>
            {!editing && (
              <button
                onClick={handleEditProfile}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Liked Games Section */}
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Liked Games</h2>
            {userProfile.likedGames && userProfile.likedGames.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-64">
                {userProfile.likedGames.map((game) => (
                  <li key={game.gameId} className="mb-2">
                    <Link href={`/games/${game.gameId}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                          <img
                            src={
                              covers[game.gameId] ||
                              "/path/to/placeholder-image.png"
                            }
                            alt={game.gameName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-center font-medium">
                            {game.gameName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg">You have not liked any games yet.</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="md:col-span-2">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Your Reviews</h2>
            {userProfile.reviews && userProfile.reviews.length > 0 ? (
              <ul className="space-y-4">
                {userProfile.reviews
                  .filter((review) => review.rating > 0)
                  .map((review) => (
                    <li
                      key={review.gameId}
                      className="p-4 border border-gray-300 rounded bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <Link href={`/games/${review.gameId}`}>
                        <p className="text-xl font-bold hover:underline">
                          {review.gameName}
                        </p>
                      </Link>
                      <p className="text-yellow-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </p>
                      <p className="mt-2">{review.comment}</p>
                      {review.containsSpoilers && (
                        <p className="text-red-500 mt-1">Contains Spoilers</p>
                      )}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-lg">You have not written any reviews yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal para editar perfil */}
      {editing && (
        <Modal
          isOpen={editing}
          onClose={() => setEditing(false)}
          onSave={handleSaveProfile}
          setBio={setBio}
          setProfilePicture={setProfilePicture}
          bio={bio}
          profilePicture={profilePicture}
        />
      )}
    </div>
  );
}
