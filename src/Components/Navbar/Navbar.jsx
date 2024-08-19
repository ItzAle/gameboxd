"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <Link href="/" legacyBehavior>
        <a className="text-xl font-bold">Gameboxd</a>
      </Link>
      <form onSubmit={handleSearch} className="flex-grow mx-4">
        <input
          type="text"
          placeholder="Search games or users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md text-black"
        />
      </form>
      <div>
        {session ? (
          <>
            <Link href="/profile" legacyBehavior>
              <a className="mr-4">Profile</a>
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" legacyBehavior>
            <a className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
              Login
            </a>
          </Link>
        )}
      </div>
    </nav>
  );
}
