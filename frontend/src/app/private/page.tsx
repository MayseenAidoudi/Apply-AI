'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Private() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  });
  const router = useRouter();


  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Private Page</h1>
      <p>Welcome, {session.user?.email}</p>
      <p>Your credits: {session.user?.credits}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}