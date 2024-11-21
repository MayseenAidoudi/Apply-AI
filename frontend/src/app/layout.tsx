'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
        <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}