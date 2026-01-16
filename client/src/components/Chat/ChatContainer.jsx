import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
const VoiceMessage = dynamic(() => import("./VoiceMessage"), {
  ssr: false,
});

function ChatContainer() {
  const [
    { messages, currentChatUser, userInfo, searchQuery, searchMatches, searchIndex },
    dispatch,
  ] = useStateProvider();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messageRefs = useRef([]);
  const [, setLocal] = useState();

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const id = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(id);
  }, [messages]);

  useEffect(() => {
    if (!searchQuery) {
      dispatch({ type: reducerCases.SET_SEARCH_RESULTS, matches: [] });
      dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: 0 });
      return;
    }

    const q = searchQuery.toLowerCase();
    const found = [];

    messages.forEach((m, idx) => {
      if (m.type === "text" && m.message?.toLowerCase().includes(q)) {
        found.push(idx);
      }
    });

    dispatch({ type: reducerCases.SET_SEARCH_RESULTS, matches: found });
    dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: 0 });
    setLocal(found.length);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (!searchMatches?.length) return;
    const ref = messageRefs.current[searchMatches[searchIndex]];
    ref?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchIndex, searchMatches]);

  return (
    <div
      ref={messagesContainerRef}
      className="h-[80vh] w-full relative grow overflow-auto custom-scrollbar"
    >
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed inset-0 z-0" />

      <div className="mx-10 my-6 relative z-40">
        <div className="flex flex-col gap-1">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || message.temp_id || index}
              refEl={(el) => (messageRefs.current[index] = el)}
              message={message}
              index={index}
              currentChatUser={currentChatUser}
              userInfo={userInfo}
              searchQuery={searchQuery}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;

function MessageBubble({
  message,
  refEl,
  currentChatUser,
  userInfo,
  searchQuery,
  index,
}) {
  const isIncoming = message.sender_id === currentChatUser.id;
  const isHighlighted =
    searchQuery &&
    message.message?.toLowerCase().includes(searchQuery.toLowerCase());

  const renderHighlightedText = () => {
    if (!isHighlighted) return message.message;

    const parts = [];
    const text = message.message;
    const q = searchQuery.toLowerCase();
    let start = 0;
    let idx = text.toLowerCase().indexOf(q);

    while (idx !== -1) {
      if (idx > start) parts.push(text.slice(start, idx));
      parts.push(
        <span key={idx} className="bg-yellow-300 text-black">
          {text.slice(idx, idx + q.length)}
        </span>
      );
      start = idx + q.length;
      idx = text.toLowerCase().indexOf(q, start);
    }

    if (start < text.length) parts.push(text.slice(start));
    return parts;
  };

  return (
    <motion.div
      ref={refEl}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`flex ${!isIncoming ? "justify-end" : "justify-start"}`}
    >

      {/* TEXT */}
      {message.type === "text" && (
        <div
          className={`max-w-[75%] px-4 py-2.5 rounded-2xl
            ${!isIncoming ? "bg-primary text-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"}
            ${isHighlighted ? "ring-2 ring-yellow-400" : ""}
          `}
        >
          <p className="text-sm leading-relaxed">{renderHighlightedText()}</p>

          <div 
            className={`flex items-center justify-end gap-1 mt-1 ${
            !isIncoming ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
          >
            <span className="text-[10px]">
              {calculateTime?.(message.created_at)}
            </span>
            {message.sender_id === userInfo.id && (
              <MessageStatus status={message.message_status} />
            )}
          </div>
        </div>
      )}

      {/* IMAGE */}
      {message.type === "image" && (
        <ImageMessage
          message={message}
          userInfo={userInfo}
          currentChatUser={currentChatUser}
        />
      )}

      {/* AUDIO */}
      {message.type === "audio" && (
        <VoiceMessage
          message={message}
          userInfo={userInfo}
          currentChatUser={currentChatUser}
        />
      )}

      {/* Outgoing avatar spacer */}
      {!isIncoming && <div className="ml-2 w-8 h-8 invisible" />}
    </motion.div>
  );
}
