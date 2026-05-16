/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { reportData } from './data';
import { Slide } from './components/Slide';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const sections = reportData.sections;

  const nextSlide = () => {
    if (currentIndex === sections.length - 1) return;
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => prev - 1);
  };

  const nextRef = useRef(nextSlide);
  const prevRef = useRef(prevSlide);

  useEffect(() => {
    nextRef.current = nextSlide;
    prevRef.current = prevSlide;
  }, [currentIndex]);

  // Allow keyboard and scroll navigation seamlessly
  useEffect(() => {
    let lastScrollTime = Date.now();

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      // Enforce a cool-down of 1.2s between scrolls
      if (now - lastScrollTime < 1200) return; 
      if (Math.abs(e.deltaY) < 30) return; // Ignore slight trackpad noise

      if (e.deltaY > 0) {
        nextRef.current();
      } else {
        prevRef.current();
      }
      lastScrollTime = now;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') nextRef.current();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevRef.current();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Cursor tracking for spatial feel (Keep values for parallax, but remove custom cursor dot)
  const mousePosX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 500);
  const mousePosY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 500);

  const cursorX = useSpring(mousePosX, { stiffness: 1500, damping: 40, mass: 0.1 });
  const cursorY = useSpring(mousePosY, { stiffness: 1500, damping: 40, mass: 0.1 });
  const slowCursorX = useSpring(mousePosX, { stiffness: 300, damping: 30, mass: 0.5 });
  const slowCursorY = useSpring(mousePosY, { stiffness: 300, damping: 30, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosX.set(e.clientX);
      mousePosY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mousePosX, mousePosY]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col font-sans select-none text-[#F5F5F7] ">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[120px]"
          style={{ x: useTransform(slowCursorX, [0, typeof window !== "undefined" ? window.innerWidth : 1000], [-100, 100]), y: useTransform(slowCursorY, [0, typeof window !== "undefined" ? window.innerHeight : 1000], [-100, 100]) }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[150px]"
          style={{ x: useTransform(slowCursorX, [0, typeof window !== "undefined" ? window.innerWidth : 1000], [100, -100]), y: useTransform(slowCursorY, [0, typeof window !== "undefined" ? window.innerHeight : 1000], [100, -100]) }}
        />
      </div>

      {/* Header */}
      <header className="absolute top-10 left-12 md:left-20 right-12 z-50 flex justify-between items-start pointer-events-none opacity-80 mix-blend-difference">
        <div className="flex flex-col gap-1">
          <h1 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90">{reportData.title}</h1>
          <p className="text-[10px] uppercase tracking-widest text-white/50">{reportData.author}</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <Slide 
            key={currentIndex} 
            section={sections[currentIndex]}
            direction={direction}
            mouseX={mousePosX}
            mouseY={mousePosY}
          />
        </AnimatePresence>
      </main>

      {/* Apple-style Segmented Dock */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full"
      >
        {sections.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx === currentIndex) return;
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className="group relative flex items-center justify-center h-8 px-2 outline-none "
            aria-label={`Go to slide ${idx + 1}`}
          >
            <motion.div
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-2 group-hover:bg-white/60 group-hover:w-4'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
