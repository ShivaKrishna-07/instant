import React from "react";
import { Loader as LucideLoader } from "lucide-react";

export default function Loader({ className = "h-6 w-6 text-current", wrapperClass = "" }) {
  return (
    <div className={`flex items-center justify-center ${wrapperClass}`}>
      <LucideLoader className={`animate-spin ${className}`} />
    </div>
  );
}
