"use client";
import { useParams } from "next/navigation";
import OtherUserProfile from "../../../Components/UserProfile/OtherUserProfile";
import { useAuth } from "../../../context/AuthContext";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId;
  const { user } = useAuth();

  // Si no hay userId, muestra un mensaje de carga
  if (!userId) {
    return <p className="text-white">Cargando...</p>;
  }

  // Si el userId es el mismo que el del usuario actual, redirige a la página de perfil propio
  if (user && user.uid === userId) {
    router.push("/profile");
    return null;
  }

  return (
    <div>
      <OtherUserProfile userId={userId} />
    </div>
  );
}
