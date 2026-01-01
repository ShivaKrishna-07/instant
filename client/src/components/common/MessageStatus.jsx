import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ status }) {
  return <div>
    {status === "sent" && <BsCheck className="text-lg" />}
    {status === "delivered" && <BsCheckAll className="text-lg" />}
    {status === "read" && <BsCheckAll className="text-lg text-icon-ack" />}
  </div>;
}

export default MessageStatus;
