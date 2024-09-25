import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import TransparentNavbar from "../../Components/Navbar/TransparentNavbar";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementar lógica para guardar cambios
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white">
      <TransparentNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-gray-800 rounded px-3 py-2"
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
