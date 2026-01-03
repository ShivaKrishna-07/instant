import React from "react";
import { IoCheckmarkDone, IoCheckmarkOutline } from "react-icons/io5";

function MessageStatus({ status }) {
  return <div>
    {status === "sent" && <IoCheckmarkOutline className="text-lg" />}
    {status === "delivered" && <IoCheckmarkDone className="text-lg" />}
    {status === "read" && <IoCheckmarkDone className="text-lg text-icon-ack" />}
  </div>;
}

export default MessageStatus;
