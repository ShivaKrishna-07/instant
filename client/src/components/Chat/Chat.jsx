import React from "react";
import ChatHeader from "./ChatHeader";
import ChatContainer from "./ChatContainer";
import MessageBar from "./MessageBar";

function Chat({ isMobile = false, onBackClick }) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-background min-w-0">
      <ChatHeader isMobile={isMobile} onBackClick={onBackClick} />
      <ChatContainer />
      <MessageBar />
    </div>
  );
}

export default Chat;
