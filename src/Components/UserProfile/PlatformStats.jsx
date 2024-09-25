import { FaWindows, FaPlaystation, FaXbox, FaApple } from "react-icons/fa";

export default function PlatformStats({ userProfile }) {
  const platformIcons = {
    pc: FaWindows,
    playstation: FaPlaystation,
    xbox: FaXbox,
    mac: FaApple,
  };

  // Verificar si userProfile y userProfile.games existen
  const games = userProfile?.games || [];

  const platformCounts = games.reduce((acc, game) => {
    if (game.platforms) {
      game.platforms.forEach(platform => {
        acc[platform] = (acc[platform] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const totalGames = Object.values(platformCounts).reduce((a, b) => a + b, 0);

  if (totalGames === 0) {
    return <p>No hay datos de plataformas disponibles.</p>;
  }

  return (
    <div className="flex justify-between">
      {Object.entries(platformCounts).map(([platform, count]) => {
        const Icon = platformIcons[platform] || FaWindows; // Usar FaWindows como icono por defecto
        const percentage = (count / totalGames) * 100;
        return (
          <div key={platform} className="flex flex-col items-center">
            <Icon className="text-4xl mb-2" />
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="mt-1">{count} juegos</span>
          </div>
        );
      })}
    </div>
  );
}
