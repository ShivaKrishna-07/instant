"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedOrb({ className, delay = 0, duration = 20, size = "w-96 h-96" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0.4, 0.6, 0.4],
        scale: [1, 1.2, 1],
      }}
      transition={{ 
        delay,
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={`absolute rounded-full blur-[120px] ${size} ${className}`}
    />
  );
}

function GeometricShape({ className, delay = 0, rotate = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: rotate ? [0, 360] : 0
      }}
      transition={{ 
        opacity: { delay, duration: 1 },
        scale: { delay, duration: 1, type: "spring" },
        rotate: { duration: 50, repeat: Infinity, ease: "linear" }
      }}
      className={className}
    />
  );
}

function FloatingRing({ size, className, delay = 0, duration = 8 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.05, 1],
        y: [0, -20, 0]
      }}
      transition={{ 
        delay,
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      <div 
        className="rounded-full border border-primary/20"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
}

function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#smallGrid)" />
      </svg>
    </div>
  );
}

function NoiseTexture() {
  return (
    <div 
      className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function CenterPulse() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
          initial={{ width: 100, height: 100, opacity: 0 }}
          animate={{ 
            width: [100, 400],
            height: [100, 400],
            opacity: [0.5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 1.3,
            ease: "easeOut"
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="relative w-20 h-20 rounded-full bg-primary/5 backdrop-blur-xl border border-primary/20 flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 rounded-full bg-primary/10"
        />
      </motion.div>
    </div>
  );
}

export default function LoginVisual() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // generate deterministic-seeming positions/timings on client only
    const pts = Array.from({ length: 20 }).map(() => {
      return {
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      };
    });
    setPositions(pts);
  }, []);

  return (
    <div className="relative w-full h-full bg-card overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      
      {/* Animated gradient orbs */}
      <AnimatedOrb 
        className="bg-primary/20 -top-48 -left-48" 
        delay={0} 
        duration={25}
        size="w-[500px] h-[500px]"
      />
      <AnimatedOrb 
        className="bg-primary/15 -bottom-32 -right-32" 
        delay={2} 
        duration={20}
        size="w-[400px] h-[400px]"
      />
      <AnimatedOrb 
        className="bg-primary/10 top-1/3 right-1/4" 
        delay={4} 
        duration={22}
        size="w-[300px] h-[300px]"
      />
      <AnimatedOrb 
        className="bg-primary/10 bottom-1/4 left-1/3" 
        delay={3} 
        duration={18}
        size="w-[350px] h-[350px]"
      />

      {/* Grid pattern */}
      <GridPattern />

      {/* Noise texture */}
      <NoiseTexture />

      {/* Floating rings */}
      <FloatingRing size={300} className="absolute top-[10%] right-[5%]" delay={0.5} duration={10} />
      <FloatingRing size={200} className="absolute bottom-[15%] left-[10%]" delay={1} duration={8} />
      <FloatingRing size={150} className="absolute top-[40%] left-[5%]" delay={1.5} duration={12} />

      {/* Geometric shapes */}
      <GeometricShape 
        className="absolute top-[20%] right-[20%] w-32 h-32 border border-primary/10 rounded-3xl"
        delay={0.3}
      />
      <GeometricShape 
        className="absolute bottom-[30%] right-[15%] w-24 h-24 border border-primary/5 rounded-2xl"
        delay={0.6}
        rotate={false}
      />
      <GeometricShape 
        className="absolute top-[60%] left-[20%] w-16 h-16 border border-primary/10 rounded-xl"
        delay={0.9}
      />

      {/* Center pulse effect */}
      <CenterPulse />

      {/* Floating dots - generated on client to avoid SSR randomness */}
      {/** positions is empty on server; populated after mount to avoid hydration mismatch **/}
      {positions.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/20"
          style={{ left: `${p.left}%`, top: `${p.top}%`, opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}

      {/* Diagonal lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${i * 15}%`}
            y1="0"
            x2={`${i * 15 + 30}%`}
            y2="100%"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Bottom tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="text-sm text-muted-foreground font-light tracking-wider">
          FAST · SECURE · BEAUTIFUL
        </p>
      </motion.div>
    </div>
  );
}
