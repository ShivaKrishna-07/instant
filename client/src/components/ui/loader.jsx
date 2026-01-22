import React from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

export default function Loader({ wrapperClass = "", message = null, logoSize = "sm" }) {
  return (
    <div className={`flex flex-col items-center justify-center ${wrapperClass}`}>
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-40 rounded-full bg-primary/10 blur-2xl"
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <motion.div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-primary" />
            </motion.div>
            <motion.div
              animate={{ scale: [0.85, 1, 0.85], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-2 rounded-full bg-primary/10"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>

          {/* {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-muted-foreground">
              {message}
            </motion.p>
          )} */}
        </div>
      </div>
    </div>
  );
}
