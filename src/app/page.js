"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to Gameboxd</h1>
      <p className="text-xl mb-10">
        Discover, track, and review your favorite games.
      </p>
      <div>
        <Link href={"/all"}>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg mr-4 hover:bg-blue-600 transition">
            Browse Games
          </button>
        </Link>
        <button className="bg-gray-700 text-white px-6 py-3 rounded-md text-lg hover:bg-gray-800 transition">
          Learn More
        </button>
      </div>
    </div>
  );
}
