"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Actualiza a Pro</h1>
      <button onClick={handleUpgrade} disabled={isLoading}>
        {isLoading ? "Procesando..." : "Actualizar a Pro"}
      </button>
    </div>
  );
}
