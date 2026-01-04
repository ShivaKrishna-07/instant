import React from "react";
import { IoCheckmarkDone, IoCheckmarkOutline, IoAlertCircleOutline } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";

function MessageStatus({ status }) {
  return (
    <div className="flex items-center">
      {status === "sending" && (
        <FaSpinner className="text-sm animate-spin text-white/70" />
      )}
      {status === "failed" && (
        <IoAlertCircleOutline className="text-sm text-red-400" />
      )}
      {status === "sent" && (
        <IoCheckmarkOutline className="text-sm text-white/70" />
      )}
      {status === "delivered" && (
        <IoCheckmarkDone className="text-sm text-white/70" />
      )}
      {status === "read" && (
        <IoCheckmarkDone className="text-sm text-icon-ack" />
      )}
    </div>
  );
}

export default MessageStatus;
