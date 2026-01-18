import React from "react";
import { motion } from "framer-motion";

export function ChatSkeleton() {
  const skeletonMessages = [
    { isOwn: false, width: "60%" },
    { isOwn: true, width: "45%" },
    { isOwn: false, width: "70%" },
    { isOwn: true, width: "55%" },
    { isOwn: false, width: "40%" },
    { isOwn: true, width: "65%" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="h-14 sm:h-16 px-3 sm:px-4 flex items-center gap-3 border-b border-border bg-card shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 sm:w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3 sm:p-4 space-y-4">
        {skeletonMessages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex flex-col gap-1.5 ${msg.isOwn ? "items-end" : "items-start"}`} style={{ width: msg.width }}>
              <div className={`h-12 sm:h-14 w-full rounded-2xl ${msg.isOwn ? "rounded-br-md bg-primary/20" : "rounded-bl-md bg-muted"} animate-pulse`} />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center pt-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-3 sm:p-4 border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 h-10 rounded-full bg-muted animate-pulse" />
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default ChatSkeleton;
