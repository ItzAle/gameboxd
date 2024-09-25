import { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";

export default function CollectionsTab({ userProfile }) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // Aquí deberías cargar las colecciones del usuario
    // Por ahora, usaremos datos de ejemplo
    setCollections([
      { id: 1, name: "Best Horror Games", gameCount: 5 },
      { id: 2, name: "Indie Gems", gameCount: 10 },
      { id: 3, name: "Games to Play in 2023", gameCount: 8 },
    ]);
  }, [userProfile]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Your Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center"
          >
            <FaList className="text-2xl mr-3 text-blue-500" />
            <div>
              <h3 className="font-semibold">{collection.name}</h3>
              <p className="text-sm text-gray-400">
                {collection.gameCount} games
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
