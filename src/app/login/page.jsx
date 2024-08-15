"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">You're already logged in</h1>
        <p className="text-lg mb-8">Welcome, {session.user.name}!</p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-6 py-3 rounded-md text-lg hover:bg-red-600 transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Si el usuario no está autenticado
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Login to Gameboxd</h1>
      <button
        onClick={() => signIn("google")}
        className="bg-blue-500 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
