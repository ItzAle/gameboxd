"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function TestGameRelease() {
  const [gameName, setGameName] = useState("");
  const [gameId, setGameId] = useState("");
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.email !== "alexcs9230@gmail.com") {
      router.push("/"); // Redirige a la página principal si no es el usuario autorizado
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.email !== "alexcs9230@gmail.com") {
      setMessage("No tienes permiso para realizar esta acción.");
      return;
    }

    console.log("Sending data:", {
      gameId,
      gameName,
      userId: user.uid,
    });

    try {
      const response = await fetch("/api/testGameRelease", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          gameName,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        setMessage("Notificación de prueba enviada con éxito.");
      } else {
        const errorData = await response.json();
        setMessage(`Error al enviar la notificación de prueba: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage(`Error al enviar la notificación de prueba: ${error.message}`);
    }
  };

  if (!user || user.email !== "alexcs9230@gmail.com") {
    return <div>No tienes permiso para acceder a esta página.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Game Release Notification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gameName" className="block mb-1">Game Name:</label>
          <input
            type="text"
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="gameId" className="block mb-1">Game ID:</label>
          <input
            type="text"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 text-white"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send Test Notification
        </button>
      </form>
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}
