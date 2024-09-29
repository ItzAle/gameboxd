import dynamic from "next/dynamic";

const ClientChristmasParticles = dynamic(
  () => import("./ClientChristmasParticles"),
  { ssr: false }
);

export default function ChristmasParticles() {
  return <ClientChristmasParticles />;
}
