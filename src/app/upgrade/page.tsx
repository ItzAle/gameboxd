"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../Components/CheckoutForm/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function UpgradePage() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((error) => console.error("Error:", error));
  }, [user]);

  const appearance = {
    theme: "stripe" as const,
  };

  const options = {
    clientSecret,
    appearance,
    paymentMethodCreation: "manual" as const,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Actualiza a Pro</h1>
      <ul className="list-disc list-inside mb-6">
        <li>Estadísticas anuales</li>
        <li>Filtrado por servicios de streaming favoritos</li>
        <li>Notificaciones de lista de deseos</li>
        <li>Sin anuncios de terceros</li>
      </ul>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}
