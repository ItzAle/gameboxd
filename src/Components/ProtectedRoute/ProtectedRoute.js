import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return children;
}
