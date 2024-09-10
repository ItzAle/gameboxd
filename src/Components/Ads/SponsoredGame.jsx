import React from 'react';
import Link from 'next/link';

export default function SponsoredGame({ game }) {
  return (
    <div className="sponsored-game bg-gray-800 p-4 rounded-lg shadow-lg">
      <span className="text-xs text-gray-400">Patrocinado</span>
      <Link href={`/games/${game.slug}`}>
        <img src={game.coverImageUrl} alt={game.name} className="w-full h-48 object-cover rounded" />
        <h3 className="text-lg font-semibold mt-2">{game.name}</h3>
      </Link>
    </div>
  );
}