import React from "react";
import { IoCheckmarkDone, IoCheckmarkOutline, IoAlertCircleOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { CheckCheck } from "lucide-react";

function MessageStatus({ status }) {
  return (
    <div>
      {status === "sending" && (
        <FaSpinner className="text-sm animate-spin text-white/70" />
      )}
      {status === "failed" && (
        <IoAlertCircleOutline className="text-sm text-red-400" />
      )}
      {status === "sent" && (
        <IoCheckmarkOutline className="text-sm text-primary-foreground/70" />
      )}
      {status === "delivered" && (
        <CheckCheck className="text-[5px] text-primary-background/50" />
      )}
      {status === "read" && (
        <CheckCheck className="text-[5px] text-primary-background/70" />
      )}
    </div>
  );
}

export default MessageStatus;
