"use client";

import { useHalloween } from "../context/HalloweenContext";
import dynamic from "next/dynamic";
import LandingPage from "../Components/LandingPage/LandingPage";

const ClientHalloweenParticles = dynamic(
  () => import("../Components/ClientHalloweenParticles"),
  { ssr: false }
);

export default function Home() {
  const { isHalloweenMode } = useHalloween();

  return (
    <div className="relative">
      {isHalloweenMode && <ClientHalloweenParticles />}
      <main>
        <LandingPage />
      </main>
    </div>
  );
}
