import dynamic from 'next/dynamic';

const ClientHalloweenParticles = dynamic(
  () => import('./ClientHalloweenParticles'),
  { ssr: false }
);

export default function HalloweenParticles() {
  return <ClientHalloweenParticles />;
}
