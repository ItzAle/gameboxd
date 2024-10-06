import React, { useMemo } from "react";

const NextWeek = ({ allGames }) => {
  const nextWeekGames = useMemo(() => {
    const today = new Date();
    const startOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    const endOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);
    
    return allGames.filter(game => {
      const releaseDate = new Date(game.releaseDate);
      return releaseDate >= startOfNextWeek && releaseDate < endOfNextWeek;
    }).sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
  }, [allGames]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Releases Next Week</h2>
      {nextWeekGames.length > 0 ? (
        nextWeekGames.map((game) => (
          <div key={game.id} className="mb-4">
            <h3 className="text-xl font-semibold">{game.name}</h3>
            <p>Release Date: {new Date(game.releaseDate).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No games releasing next week.</p>
      )}
    </div>
  );
};

export default NextWeek;
