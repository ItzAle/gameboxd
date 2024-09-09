import React from "react";
import AllGames from "../../Components/AllGames/AllGames";

export const metadata = {
  title: "All Games",
  description: "All Games page",
};

function page() {
  return (
    <div>
      <AllGames />
    </div>
  );
}

export default page;
