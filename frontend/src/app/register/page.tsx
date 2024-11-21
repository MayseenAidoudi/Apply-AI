'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import GoogleIcon from '@/components/GoogleIcon';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/private');  // Redirect to /private if session exists
    }
  }, [session, status, router]);

  const popupCenter = (url: string | URL | undefined, title: string | undefined) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;
    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${550 / systemZoom
      },top=${top},left=${left}`
    );

    newWindow?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const responseData = await response.json(); // Parse the JSON response

    if (!response.ok) {
      // Use the actual error message from the server response
      toast({
        title: "Error",
        description: responseData.error || "Registration failed",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Registration successful",
    });
    router.push('/login');
  };

  const handleGoogleSignIn = () => {
    popupCenter("/auth/google-signin", "Google Sign-In");
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-200 relative flex items-center justify-center">

      {/* Header */}
      <nav className="w-full py-4 bg-gray-900 absolute top-0 z-10">
        <div className="container mx-auto px-8">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white">
              <Link href="/">Apply<span className="text-indigo-500">.tn</span></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900 to-gray-900"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="text-2xl font-bold text-white">
                  Apply<span className="text-indigo-500">.tn</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-white">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Fill in your details to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Sign Up
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-300"
              >
                <GoogleIcon />
                Sign up with Google
              </Button>
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-500 hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 bg-gray-900">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-white text-sm">
            <Link href="/">© 2024 Apply<span className="text-indigo-500">.tn</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
