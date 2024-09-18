"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function UpgradeSuccess() {
  const router = useRouter();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) return;

      const sessionId = new URLSearchParams(window.location.search).get(
        "session_id"
      );
      if (!sessionId) {
        router.push("/upgrade");
        return;
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId: user.uid }),
        });

        if (response.ok) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { isPro: true });
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        router.push("/upgrade");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [user, router]);

  if (isVerifying) {
    return <div>Verificando tu pago...</div>;
  }

  return (
    <div>
      <h1>¡Gracias por actualizar a Pro!</h1>
      <p>Tu cuenta ha sido actualizada exitosamente.</p>
    </div>
  );
}
