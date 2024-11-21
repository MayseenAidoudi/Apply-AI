"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Laptop,
  Users,
  LucideIcon,
  Github,
  Twitter,
  Linkedin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedHeroSection from "@/components/AnimatedHero";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Menu, X } from 'lucide-react';



interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }} // Subtle hover effect
    transition={{ type: "spring", stiffness: 200, damping: 20 }} // Softer animation
  >
    <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 h-full">
      <CardHeader>
        <Icon className="h-10 w-10 text-indigo-500 mb-2" />
        <CardTitle className="text-xl font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  features,
  isPopular = false,
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }} // Subtle hover effect
    transition={{ type: "spring", stiffness: 200, damping: 20 }} // Softer animation
    className="relative"
  >
    {isPopular && (
      <div className="absolute -top-4 -right-4 z-10">
        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </Badge>
      </div>
    )}
    <Card
      className={`${
        isPopular
          ? "border-indigo-500 shadow-lg shadow-indigo-500/50"
          : "border-gray-800"
      } bg-gradient-to-br from-gray-900 to-gray-950 h-full`}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
        <CardDescription className="text-4xl font-bold text-indigo-400">
          ${price}
          <span className="text-lg font-normal text-gray-500">/mo</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300">
              <CheckCircle2 className="h-5 w-5 text-indigo-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          Get Started
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

const LandingPage: React.FC = () => {
  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle email submission logic here
    console.log("Email submitted");
  };

  const { data: session,status } = useSession();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900 to-gray-900"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]"
        />
      </div>

      <div className="relative z-10">
      <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-wrap justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold">
          <Link href="/">Apply<span className="text-indigo-500">.tn</span></Link>
          </div>

          {/* Hamburger Icon for mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              onClick={toggleMenu}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Links and User Menu */}
          <div className={`w-full md:w-auto md:flex md:items-center mt-4 md:mt-0 ${menuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2 md:mb-0"
                onClick={() => scrollToSection("features-section")}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-indigo-500  focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2 md:mb-0"
                onClick={() => scrollToSection("pricing-section")}
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-indigo-500  focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-2 md:mb-0 md:mr-2"
                onClick={() => scrollToSection("Testimonial-section")}
              >
                Testimonials
              </Button>
            </div>
            
            <div className="mt-4 md:mt-0 md:ml-4 flex justify-center md:justify-start">
              {status === 'loading' ? null : status === 'authenticated' ? (
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
              ) : (
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                  onClick={handleLoginClick}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>

        <main className="container mx-auto px-4">
          <AnimatedHeroSection />
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-20  flex-col lg:flex-row lg:justify-between lg:items-center hidden"
          >
            {/* Text on the left */}
            <div className="lg:w-1/2">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Land Your Dream Job with AI
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg">
                Revolutionize your job search with AI-powered CVs and cover
                letters. Stand out, get noticed, and secure interviews faster
                than ever.
              </p>
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Get Started For Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Placeholder image on the right, hidden on small screens */}
            <div className="hidden lg:flex lg:w-1/2 lg:pl-16 mt-10 lg:mt-0 justify-center">
              <img
                src="/path-to-placeholder-image.png" // Replace with the actual image path
                alt="AI Job Search"
                className="max-w-full h-auto"
              />
            </div>
          </motion.section>
          {/* Updated Features Section */}
          <motion.section
          id="features-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Why Choose Apply.ai?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={Zap}
                title="AI-Powered Optimization"
                description="Our advanced AI analyzes job descriptions to create perfectly tailored CVs and cover letters in seconds."
              />
              <FeatureCard
                icon={Laptop}
                title="User-Friendly Interface"
                description="Intuitive design makes it easy to create, edit, and manage your job application documents effortlessly."
              />
              <FeatureCard
                icon={Users}
                title="ATS-Friendly Formats"
                description="Ensure your applications pass through Applicant Tracking Systems with our optimized document formats."
              />
            </div>
          </motion.section>

          <motion.section
            id="pricing-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="py-20 lg:pb-44" // Increased padding for desktop
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Pricing Plans
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Pricing Cards */}
              <PricingCard
                title="Basic"
                price={9}
                features={[
                  "5 AI-generated CVs per month",
                  "3 Cover letters per month",
                  "Basic templates",
                ]}
              />
              <PricingCard
                title="Pro"
                price={19}
                isPopular={true}
                features={[
                  "Unlimited AI-generated CVs",
                  "Unlimited Cover letters",
                  "Premium templates",
                  "Priority support",
                ]}
              />
              <PricingCard
                title="Enterprise"
                price={49}
                features={[
                  "All Pro features",
                  "Custom branding",
                  "Team collaboration",
                  "API access",
                ]}
              />
            </div>
          </motion.section>

          <motion.section
          id="Testimonial-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="py-20 lg:py-32 bg-gray-900 text-gray-200 mb-20"
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-white">
              What Our Users Say
            </h2>
            <div className="grid lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-4 lg:px-0">
              {/* Testimonial 1 */}
              <motion.div
                className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition duration-500 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="/path-to-user1.jpg"
                    alt="User 1"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      John Doe
                    </h3>
                    <p className="text-sm text-gray-400">Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "This product has completely transformed my workflow. The
                  intuitive design and easy-to-use features are perfect for my
                  daily tasks."
                </p>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div
                className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition duration-500 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="/path-to-user2.jpg"
                    alt="User 2"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Jane Smith
                    </h3>
                    <p className="text-sm text-gray-400">Product Manager</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "I've never been more satisfied with a product. The customer
                  support is outstanding, and the performance is top-notch."
                </p>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div
                className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition duration-500 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src="/path-to-user3.jpg"
                    alt="User 3"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Emily Clark
                    </h3>
                    <p className="text-sm text-gray-400">UI/UX Designer</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Amazing tool for anyone who needs to streamline their
                  projects. The interface is clean and modern, which I
                  absolutely love."
                </p>
              </motion.div>
            </div>
          </motion.section>
        </main>

        {/* Updated Footer */}
        <footer className="py-10 bg-gray-900">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="text-white text-lg font-bold">
              Apply<span className="text-indigo-500">.tn</span>
            </div>
            <div className="space-x-4 text-gray-400">
              <a href="#" className="hover:text-indigo-400">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-indigo-400">
                Terms of Service
              </a>
            </div>
            <div className="space-x-4 text-gray-400 flex items-center">
              <a href="#" aria-label="Github" className="hover:text-indigo-400">
                <Github className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-indigo-400"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-indigo-400"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
