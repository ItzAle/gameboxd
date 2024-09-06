"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfile from "../../Components/UserProfile/UserProfile";
export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div>
      <UserProfile />
    </div>
  );
}
