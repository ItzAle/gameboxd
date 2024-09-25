export default function UserStats({ userProfile }) {
  // Usar el operador de encadenamiento opcional y proporcionar valores por defecto
  const reviewsCount = userProfile?.reviews?.length || 0;
  const gamesPlayedCount = userProfile?.gamesPlayed?.length || 0;
  const collectionsCount = userProfile?.collections?.length || 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Reviews" value={reviewsCount} />
      <StatCard title="Games Played" value={gamesPlayedCount} />
      <StatCard title="Collections" value={collectionsCount} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
