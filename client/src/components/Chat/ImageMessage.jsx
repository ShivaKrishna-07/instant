import { calculateTime } from "@/utils/CalculateTime";
import React from "react";
import MessageStatus from "../common/MessageStatus";
import Image from "next/image";

function ImageMessage({ message, userInfo, currentChatUser }) {
  return (
    <div
      className={`p-1 rounded-lg ${
        message.sender_id === currentChatUser.id
          ? "bg-muted text-foreground"
          : "bg-primary text-primary-foreground"
      }`}
    >
      <div className="relative">
        <Image
          src={message.message}
          alt="Shared image"
          width={300}
          height={300}
          className="rounded-lg object-cover"
        />
      </div>
      <div className="flex justify-end gap-1 items-end mt-1">
        <span className="text-[10px] text-primary-foreground">
          {calculateTime?.(message.created_at) || ""}
        </span>
        {message.sender_id === userInfo.id && (
          <MessageStatus status={message.message_status} />
        )}
      </div>
    </div>
  );
}

export default ImageMessage;
