import GameDetailsPage from "../../../Components/GameDetail/GameDetail";

export const metadata = {
  title: "Game Details",
  description: "Game Details page",
};

export default function GamePage({ params }) {
  return <GameDetailsPage id={params.id} />;
}
