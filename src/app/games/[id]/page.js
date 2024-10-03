import GameDetailsPage from "../../../Components/GameDetail/GameDetail";

async function getGameDetails(id) {
  try {
    const res = await fetch(`https://api.gameboxd.me/api/game/${id}`, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
      },
      next: { revalidate: 3600 }, // Revalidar cada hora
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch game data: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching game details:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const gameDetails = await getGameDetails(params.id);

  if (!gameDetails) {
    return {
      title: "Game Not Found | Gameboxd",
      description: "The requested game could not be found.",
    };
  }

  return {
    title: `${gameDetails.name} | Gameboxd`,
    description:
      gameDetails.description?.slice(0, 160) ||
      `Details for ${gameDetails.name} on Gameboxd`,
    openGraph: {
      title: gameDetails.name,
      description:
        gameDetails.description?.slice(0, 160) ||
        `Details for ${gameDetails.name} on Gameboxd`,
      images: [{ url: gameDetails.coverImageUrl }],
    },
  };
}

export default async function GamePage({ params }) {
  const gameDetails = await getGameDetails(params.id);

  if (!gameDetails) {
    return (
      <div className="text-white text-center text-2xl bg-gray-800 h-screen">
        Game not found
      </div>
    );
  }

  return <GameDetailsPage id={params.id} initialGameData={gameDetails} />;
}
