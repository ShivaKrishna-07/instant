import { useStateProvider } from "@/context/StateContext";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), {
  ssr: false,
});

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo }] = useStateProvider();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[80vh] w-full relative grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 right-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 left-0 z-40">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1 overflow-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex w-full px-4 ${
                  message.sender_id === currentChatUser.id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {message.type === "text" && (
                  <div
                    className={`text-white px-2 py-1.25 text-small rounded-md flex items-end gap-2 max-w-[45%] ${
                      message.sender_id === currentChatUser.id
                        ? "bg-incoming-background"
                        : "bg-outgoing-background"
                    }`}
                  >
                    <span className="break-all">{message.message}</span>
                    <div className="flex gap-1 items-end">
                      <span className="text-bubble-meta pt-1 text-[11px]">
                        {
                          calculateTime?.(message.created_at) || ""
                        }
                      </span>
                      <span>
                        {message.sender_id === userInfo.id && (
                          <MessageStatus
                            status={message.message_status}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                )}
                {message.type === "image" && (
                  <ImageMessage 
                    message={message} 
                    userInfo={userInfo}
                    currentChatUser={currentChatUser}
                  />
                )}
                {message.type === "audio" && (
                  <VoiceMessage 
                    message={message} 
                    userInfo={userInfo}
                    currentChatUser={currentChatUser}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
