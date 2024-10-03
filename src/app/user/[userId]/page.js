import { Suspense } from "react";
import { notFound } from "next/navigation";
import OtherUserProfile from "../../../Components/UserProfile/OtherUserProfile";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import ClientRedirect from "../../../Components/ClientRedirect/ClientRedirect";
import { Loader2 } from "lucide-react";

async function getUserData(userId) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}

export async function generateMetadata({ params }) {
  const userData = await getUserData(params.userId);

  if (!userData) {
    return {
      title: "Usuario no encontrado",
      description: "El perfil de usuario solicitado no existe.",
    };
  }

  return {
    title: `Profile of ${userData.username}`,
    description: userData.bio || `Profile of user ${userData.username}`,
  };
}

export default async function UserProfilePage({ params }) {
  const userData = await getUserData(params.userId);

  if (!userData) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <p className="bg-gradient-to-b from-gray-900 to-black flex justify-center items-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </p>
      }
    >
      <ClientRedirect userId={params.userId} />
      <OtherUserProfile userId={params.userId} initialUserData={userData} />
    </Suspense>
  );
}
