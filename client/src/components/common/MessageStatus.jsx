import React from "react";
import { FaSpinner } from "react-icons/fa";
import { Check, CheckCheck, AlertCircle } from "lucide-react";

function MessageStatus({ status }) {
  // Use consistent icon sizes and colors across message types
  if (status === "sending") return <FaSpinner className="text-sm animate-spin text-white/70" />;
  if (status === "failed") return <AlertCircle size={14} className="text-red-400" />;
  if (status === "sent") return <Check size={14} className="text-primary-background/70" />;
  if (status === "delivered") return <CheckCheck size={14} className="text-primary-background/50" />;
  if (status === "read") return <CheckCheck size={14} className="text-primary-background/70" />;

  return null;
}

export default MessageStatus;
