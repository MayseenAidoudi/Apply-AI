import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const jobWords = ['Knowledge', 'Skills', 'Experience', 'Passion', 'Talent'];

export default function AnimatedHeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % jobWords.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-20 flex flex-col lg:flex-row lg:justify-between lg:items-center"
    >
      {/* Text on the left */}
      <div className="lg:w-1/2">
        <h1 className="text-4xl md:text-6xl font-extrabold">
          Apply{' '}
          <motion.span
            key={jobWords[currentWordIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-relaxed"


          >
            {jobWords[currentWordIndex]}
          </motion.span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-200">
          Land Your Dream Job with AI
        </h2>
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
          src="/api/placeholder/600/400"
          alt="AI Job Search"
          className="max-w-full h-auto"
        />
      </div>
    </motion.section>
  );
}
