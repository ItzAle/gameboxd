"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ClientRedirect({ userId }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.uid === userId) {
      router.push("/profile");
    }
  }, [user, userId, router]);

  return null;
}
