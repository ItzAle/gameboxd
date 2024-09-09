import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return children;
}
