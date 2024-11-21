'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn("google")} className="w-full">
      Sign in with Google
    </Button>
  );
}
