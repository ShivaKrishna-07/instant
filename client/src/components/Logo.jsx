"use client";

import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

export default function Logo({ size = "md", showText = true }) {
  const sizes = {
    sm: { icon: 20, text: "text-lg" },
    md: { icon: 28, text: "text-2xl" },
    lg: { icon: 40, text: "text-4xl" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-center gap-2"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative bg-primary rounded-xl p-2 shadow-lg">
          <Zap size={sizes[size].icon} className="text-primary-foreground" strokeWidth={2.5} />
        </div>
      </div>
      {showText && <span className={`font-bold tracking-tight text-foreground ${sizes[size].text}`}>Instant</span>}
    </motion.div>
  );
}
