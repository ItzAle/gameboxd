"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfile from "../../Components/UserProfile/UserProfile";
import ProtectedRoute from "../../Components/ProtectedRoute/ProtectedRoute";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div>
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    </div>
  );
}
