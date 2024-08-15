"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <Link href="/" legacyBehavior>
        <a className="text-xl font-bold">Gameboxd</a>
      </Link>
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
