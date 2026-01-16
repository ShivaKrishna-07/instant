import Image from "next/image";
import React from "react";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
function Empty() {
  return <div className="flex-1 flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Send size={32} className="text-muted-foreground sm:w-10 sm:h-10" />
            </div>
            <div className="px-4">
              <h3 className="text-lg sm:text-xl font-semibold">Select a conversation</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </motion.div>
        </div>
}

export default Empty;
