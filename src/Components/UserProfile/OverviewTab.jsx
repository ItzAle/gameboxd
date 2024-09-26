import Link from "next/link";
import PlatformStats from "./PlatformStats";
import FavoriteGames from "./FavoriteGames";
import UserStats from "./UserStats";
import ProBadge from "../common/ProBadge";
import { Loader2 } from "lucide-react";

export default function OverviewTab({ userProfile }) {
  if (!userProfile) {
    return (
      <div>
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 mt-8">User Statistics</h2>
      <UserStats userProfile={userProfile} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">Favorite Games</h2>
      <FavoriteGames userProfile={userProfile} />

      <h2 className="text-2xl font-semibold mb-4 mt-8">
        Platform Statistics {<ProBadge />}
      </h2>
      {userProfile.isPro ? (
        <PlatformStats userProfile={userProfile} />
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-white mb-4">
            View platform statistics is only available for PRO users.
          </p>
          <Link
            href="/upgrade"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Upgrade to PRO
          </Link>
        </div>
      )}
    </div>
  );
}
