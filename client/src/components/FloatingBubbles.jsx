import { motion } from "framer-motion";
import { MessageCircle, Heart, Smile, Star, Sparkles, Send } from "lucide-react";

export default function FloatingBubbles() {
  const bubbles = [
    { icon: MessageCircle, x: "10%", y: "20%", delay: 0, size: 48 },
    { icon: Heart, x: "80%", y: "15%", delay: 0.5, size: 36 },
    { icon: Smile, x: "70%", y: "60%", delay: 1, size: 44 },
    { icon: Star, x: "20%", y: "70%", delay: 1.5, size: 32 },
    { icon: Sparkles, x: "85%", y: "40%", delay: 2, size: 40 },
    { icon: Send, x: "15%", y: "45%", delay: 0.8, size: 38 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble, index) => {
        const Icon = bubble.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: bubble.delay, duration: 0.6, ease: "easeOut" }}
            className="absolute"
            style={{ left: bubble.x, top: bubble.y }}
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-xl"
            >
              <Icon
                size={bubble.size}
                className="text-primary/60"
                strokeWidth={1.5}
              />
            </motion.div>
          </motion.div>
        );
      })}
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
    </div>
  );
}
