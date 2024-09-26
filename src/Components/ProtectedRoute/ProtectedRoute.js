import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="text-center h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-blue-900">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    router.push("/signin");
    return null;
  }

  return children;
}
