"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function UpgradeSuccess() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const updateUserStatus = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { isPro: true });
        // Redirigir al usuario a su perfil o a una página de confirmación
        router.push("/profile");
      }
    };

    updateUserStatus();
  }, [user, router]);

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">
        ¡Gracias por actualizar a Pro!
      </h1>
      <p className="text-xl">
        Estamos procesando tu pago y actualizando tu cuenta...
      </p>
    </div>
  );
}
