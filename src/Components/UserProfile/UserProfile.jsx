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
  serverTimestamp,
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

// Modal para añadir juegos favoritos
const AddFavoriteGamesModal = ({
  isOpen,
  onClose,
  onAdd,
  favoriteGames,
  setFavoriteGames,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    // Lógica para buscar juegos en la API
    const params = {
      api_key: "54a0e172e4af5165c21d0517ca55f7c8f3d34aab",
      format: "jsonp",
      json_callback: "jsonpCallback",
      filter: `name:${searchTerm}`,
    };

    const urlParams = new URLSearchParams(params).toString();
    const apiUrlWithParams = `https://www.giantbomb.com/api/games/?${urlParams}`;

    jsonp(apiUrlWithParams, { param: "json_callback" }, (err, data) => {
      if (err) {
        console.error("Error fetching game data:", err);
      } else {
        setSearchResults(data.results);
      }
    });
  };

  const handleAddGame = (game) => {
    if (favoriteGames.length < 4) {
      setFavoriteGames([...favoriteGames, game]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Add Favorite Games</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for games"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
          >
            Search
          </button>
        </div>
        <div className="mb-4">
          <ul className="space-y-2">
            {searchResults.map((game) => (
              <li key={game.id} className="flex justify-between items-center">
                <span>{game.name}</span>
                <button
                  onClick={() => handleAddGame(game)}
                  className="bg-green-500 text-white px-2 py-1 rounded-md"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onAdd}
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
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [addingFavoriteGames, setAddingFavoriteGames] = useState(false);
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
          setFavoriteGames(userData.favoriteGames || []);

          // Obtener las carátulas de los juegos
          const newCovers = {};
          for (const game of userData.favoriteGames) {
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
          setUserProfile({ reviews: [], favoriteGames: [] });
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
        favoriteGames,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      // Actualizar el userProfile local después de guardar
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        bio,
        profilePicture,
        favoriteGames,
        updatedAt: new Date(),
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

  const handleAddFavoriteGames = () => {
    setAddingFavoriteGames(true);
  };

  const handleSaveFavoriteGames = () => {
    setAddingFavoriteGames(false);
    handleSaveProfile();
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
                {userProfile.likedGames.slice(0, 4).map((game) => (
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
            {userProfile.likedGames.length > 4 && (
              <Link href={`/profile/${user.name}/liked-games`} className="text-blue-500 hover:underline">
                View all liked games
              </Link>
            )}
          </div>

          {/* Favorite Games Section */}
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Favorite Games</h2>
            {favoriteGames.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {favoriteGames.map((game) => (
                  <li key={game.id} className="mb-2">
                    <Link href={`/games/${game.id}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                          <img
                            src={
                              covers[game.id] ||
                              "/path/to/placeholder-image.png"
                            }
                            alt={game.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-center font-medium">{game.name}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-32">
                <button
                  onClick={handleAddFavoriteGames}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300"
                >
                  + Add Favorite Games
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="md:col-span-2">
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">Recent Activity</h2>
              <Link
                href={`/profile/${user.name}/recent-activity`}
                className="text-blue-500 hover:underline"
              >
                All
              </Link>
            </div>
            {userProfile.recentActivity &&
            userProfile.recentActivity.length > 0 ? (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {userProfile.recentActivity.slice(0, 4).map((activity) => (
                  <li key={activity.gameId} className="mb-2">
                    <Link href={`/games/${activity.gameId}`} className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                        <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                          <img
                            src={
                              covers[activity.gameId] ||
                              "/path/to/placeholder-image.png"
                            }
                            alt={activity.gameName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-center font-medium">
                            {activity.gameName}
                          </p>
                          <div className="flex justify-center space-x-2 mt-2">
                            {activity.rating && (
                              <span className="text-yellow-500">
                                {"★".repeat(activity.rating)}
                                {"☆".repeat(5 - activity.rating)}
                              </span>
                            )}
                            {activity.review && (
                              <span className="text-blue-500">Review</span>
                            )}
                            {activity.like && (
                              <span className="text-red-500">♥</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg">No recent activity.</p>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold">Recent Reviews</h2>
              <Link
                href={`/profile/${user.name}/reviews`}
                className="text-blue-500 hover:underline"
              >
                More
              </Link>
            </div>
            {userProfile.reviews && userProfile.reviews.length > 0 ? (
              <ul className="space-y-4">
                {userProfile.reviews.slice(0, 2).map((review) => (
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

      {/* Modal para añadir juegos favoritos */}
      {addingFavoriteGames && (
        <AddFavoriteGamesModal
          isOpen={addingFavoriteGames}
          onClose={() => setAddingFavoriteGames(false)}
          onAdd={handleSaveFavoriteGames}
          favoriteGames={favoriteGames}
          setFavoriteGames={setFavoriteGames}
        />
      )}
    </div>
  );
}
