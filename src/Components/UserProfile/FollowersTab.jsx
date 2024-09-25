import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

export default function FollowersTab({ userProfile }) {
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    // Aquí deberías cargar los seguidores del usuario actual
    // Por ahora, usaremos datos de ejemplo
    setFollowers([
      { id: 1, username: "GameMaster", avatarUrl: "/path/to/avatar3.jpg" },
      { id: 2, username: "StrategyKing", avatarUrl: "/path/to/avatar4.jpg" },
    ]);
  }, [userProfile]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Followers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((user) => (
          <div
            key={user.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center"
          >
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-12 h-12 rounded-full mr-3"
            />
            <span className="font-semibold">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
