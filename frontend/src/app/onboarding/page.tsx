"use client";

import Onboarding from "@/components/OnboardingForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Github, Linkedin, Loader2, Twitter, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

function onboarding() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-200 relative flex flex-col">
        {/* Header */}
        {/* Header */}
        <header className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-2">
            <nav className="w-full py-4 bg-gray-900 px-8 z-10">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-white">
                  <Link href="/">
                    Apply<span className="text-indigo-500">.tn</span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-grow flex items-center justify-center">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
              <p className="mt-4 text-lg text-gray-400">Loading...</p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-4 bg-gray-900">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="text-white text-sm">
              <Link href="/">
                © 2024 Apply<span className="text-indigo-500">.tn</span>
              </Link>
            </div>
            <div className="space-x-4 text-gray-400 flex items-center">
              <a href="#" aria-label="Github" className="hover:text-indigo-400">
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-indigo-400"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-indigo-400"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
      <div className="min-h-screen w-full bg-gray-950 text-gray-200 relative flex items-center justify-center">
        {/* Header */}
        <nav className="w-full py-4 bg-gray-900 absolute top-0 z-10">
          <div className="container mx-auto px-8">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-white">
                <Link href="/">
                  Apply<span className="text-indigo-500">.tn</span>
                </Link>
              </div>

              <div className="mt-4 md:mt-0 md:ml-4 flex justify-center md:justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 h-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 hover:ring-offset-gray-800 active:ring-2 active:ring-indigo-500 active:ring-offset-2 active:ring-offset-gray-800 transition-all duration-200"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={session.user?.image ?? ""}
                          alt={session.user?.name ?? "User"}
                        />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="bg-gray-800 text-white mt-2">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/generate"
                        className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Generate
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>
        <div className="relative  z-10 container   px-4">
          <Onboarding />
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-4 bg-gray-900">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-white text-sm">
            <Link href="/">
              © 2024 Apply<span className="text-indigo-500">.tn</span>
            </Link>
          </div>
          <div className="space-x-4 text-gray-400 flex items-center">
            <a href="#" aria-label="Github" className="hover:text-indigo-400">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-indigo-400">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-indigo-400">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>

      </div>
  );
}

export default onboarding;
