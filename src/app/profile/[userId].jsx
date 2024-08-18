import { useRouter } from "next/router";
import OtherUserProfile from "../../components/OtherUserProfile";

export default function UserProfilePage() {
  const router = useRouter();
  const { userId } = router.query; // Obtén el userId de la URL

  // Si no hay userId, muestra un mensaje de carga
  if (!userId) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <OtherUserProfile userId={userId} />
    </div>
  );
}
