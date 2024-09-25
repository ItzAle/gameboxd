import PlatformStats from "./PlatformStats";
import FavoriteGames from "./FavoriteGames";
import UserStats from "./UserStats";
export default function OverviewTab({ userProfile }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Game Platforms</h2>
      <PlatformStats userProfile={userProfile} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Favorite Games</h2>
      <FavoriteGames userProfile={userProfile} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Statistics</h2>
      <UserStats userProfile={userProfile} />
    </div>
  );
}
