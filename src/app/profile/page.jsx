"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserProfile from "../../Components/UserProfile/UserProfile";
export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-8 text-center">
      {/* <h1 className="text-3xl font-bold mb-4">Welcome to your Profile</h1>
      <p className="text-lg mb-2">Email: {session.user.email}</p>
      <p className="text-lg">Name: {session.user.name}</p> */}
      <UserProfile />
    </div>
  );
}
