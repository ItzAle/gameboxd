import Link from "next/link";

const LikedGames = ({ likedGames, covers }) => (
  <div className="mb-8 p-4 border border-gray-300 rounded bg-white shadow-md">
    <h2 className="text-2xl font-semibold mb-2">Liked Games</h2>
    {likedGames.length > 0 ? (
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-64">
        {likedGames.map((game) => (
          <li key={game.gameId} className="mb-2">
            <Link href={`/games/${game.gameId}`} className="group">
              <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 h-full">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  <img
                    src={
                      covers[game.gameId] || "/path/to/placeholder-image.png"
                    }
                    alt={game.gameName}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-center font-medium">{game.gameName}</p>
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
);

export default LikedGames;
