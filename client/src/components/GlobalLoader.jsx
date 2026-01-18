import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

export function GlobalLoader({ isLoading, message = "Loading..." }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card/50 to-background" />

          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute w-96 h-96 rounded-full bg-primary/10 blur-[100px]"
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Logo size="lg" />
            </motion.div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative w-12 h-12">
                <motion.div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="w-full h-full rounded-full border-2 border-transparent border-t-primary" />
                </motion.div>
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-3 rounded-full bg-primary/10"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-muted-foreground">
                {message}
              </motion.p>
            </div>
          </div>

          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GlobalLoader;
