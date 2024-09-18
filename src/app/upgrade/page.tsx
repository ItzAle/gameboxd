"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid }),
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({ sessionId });

    if (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Actualiza a Pro</h1>
      <button onClick={handleUpgrade} disabled={isLoading}>
        {isLoading ? "Procesando..." : "Actualizar por 8€"}
      </button>
    </div>
  );
}
