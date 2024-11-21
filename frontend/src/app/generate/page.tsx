"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { Github, Linkedin, Loader2, Twitter, User } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react'
import axios from "axios";
function isProfileEmpty(session: Session | null): boolean {
  if (!session || !session.user || !session.user.profile) {
    return true;
  }

  // Check if profile is an object and has any properties
  return typeof session.user.profile !== 'object' || 
         Object.keys(session.user.profile).length === 0;
}

function generate() {
  const [jobUrl, setJobUrl] = useState("");
  const [profile, setProfile] = useState({
    name: "John Doe",
    skills: ["Python", "FastAPI", "nextJS", "fullstack-js", "AWS"],
    experience: "3 years in software development",
    education: "Bachelor's in Computer Science",
  });
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const api_url = process.env.APPLY_API
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
          router.push("/login")
        },
      });
      const router = useRouter();
      useEffect((
        () => {
          if(status === "authenticated") {
            console.log(status)
            if (isProfileEmpty(session)) {
              router.push("/onboarding")
            } else {
            }
            
          }
        }
      ),[status])

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
                <Link href="/">Apply<span className="text-indigo-500">.tn</span></Link>
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
                  <Link href="/">© 2024 Apply<span className="text-indigo-500">.tn</span></Link>
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
    
      if (!session) {
        return null;
      }


      // Function to handle the form submission and make the POST request
      const handleGenerate = async () => {
        setLoading(true);
        setError("");
      
        try {
          console.log(api_url);
          // Send the POST request to the API with the job URL and user profile
          const response = await axios.post(
            `${process.env.APPLY_API}`,
            {
              url_input: { url: jobUrl },
              user_profile: profile,
            },
            {
              headers: {
                "accept": "*/*", // Adding Content-Type header
              },
            }
          );
      
          // Get the jobId from the response
          const { jobId, message } = response.data;
          console.log(response.data)
          setJobId(jobId);
      
          // Start polling for the job status
          pollJobStatus();
        } catch (err) {
          setError("Failed to initiate job scraping. Please try again.");
          setLoading(false);
        }
      };
      
      // Function to poll the job status
      const pollJobStatus = async () => {
        try {
          const intervalId = setInterval(async () => {
            const statusResponse = await axios.get(
              `${process.env.APPLY_API}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                // Optional: Set the `withCredentials` flag if needed
                // withCredentials: true,
              }
            );
            const { status, result } = statusResponse.data;
      
            if (status === "COMPLETED") {
              setResult(result);
              setLoading(false);
              clearInterval(intervalId);
            }
          }, 3000);
        } catch (err) {
          console.error(err); // Log the error for better debugging
          setError("Error polling job status.");
          setLoading(false);
        }
      };
      
      
      
    
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 relative flex flex-col">
            {/* Header */}
            <header className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-2">
            <nav className="w-full py-4 bg-gray-900 px-8 z-10">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold text-white">
                <Link href="/">Apply<span className="text-indigo-500">.tn</span></Link>
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
                    src={session.user?.image ?? ''}
                    alt={session.user?.name ?? 'User'}
                  />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent className="bg-gray-800 text-white mt-2">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/generate" className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors">
                        Generate
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="w-full px-4 py-2 text-sm hover:bg-indigo-700 transition-colors">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              
            </div>
            </div>
            </nav>
            </div>
            </header>
            {/* Main content */}
      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Job URL Input */}
        <input
          type="text"
          placeholder="Enter job URL"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          className="w-full max-w-md p-2 mb-4 text-black"
        />

        {/* Button to trigger job scraping */}
        <Button onClick={handleGenerate} disabled={loading || !jobUrl}>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Generate Job Info"
          )}
        </Button>

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
            <p className="text-gray-400 mt-2">Scraping job info...</p>
          </motion.div>
        )}

        {/* Error message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Job Result */}
        {result && (
          <div className="bg-gray-800 p-4 mt-8 w-full max-w-3xl text-white rounded-lg">
            <h3 className="text-lg font-semibold">Job Info</h3>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
            {/* Footer */}
            <footer className="py-4 bg-gray-900">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="text-white text-sm">
                  <Link href="/">© 2024 Apply<span className="text-indigo-500">.tn</span></Link>
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
  )
}

export default generate