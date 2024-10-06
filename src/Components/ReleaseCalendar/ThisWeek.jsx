import React, { useMemo } from "react";

const ThisWeek = ({ allGames }) => {
  const thisWeekGames = useMemo(() => {
    const today = new Date();
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    
    return allGames.filter(game => {
      const releaseDate = new Date(game.releaseDate);
      return releaseDate >= today && releaseDate < endOfWeek;
    }).sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [allGames]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Releases This Week</h2>
      {thisWeekGames.length > 0 ? (
        thisWeekGames.map((game) => (
          <div key={game.id} className="mb-4">
            <h3 className="text-xl font-semibold">{game.name}</h3>
            <p>Release Date: {new Date(game.releaseDate).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No games releasing this week.</p>
      )}
    </div>
  );
};

export default ThisWeek;
