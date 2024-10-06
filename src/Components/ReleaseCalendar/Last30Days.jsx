import React, { useMemo } from "react";

const Last30Days = ({ allGames }) => {
  const last30DaysGames = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    
    return allGames.filter(game => {
      const releaseDate = new Date(game.releaseDate);
      return releaseDate >= thirtyDaysAgo && releaseDate <= today;
    }).sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
  }, [allGames]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Releases in the Last 30 Days</h2>
      {last30DaysGames.length > 0 ? (
        last30DaysGames.map((game) => (
          <div key={game.id} className="mb-4">
            <h3 className="text-xl font-semibold">{game.name}</h3>
            <p>Release Date: {new Date(game.releaseDate).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No games released in the last 30 days.</p>
      )}
    </div>
  );
};

export default Last30Days;
