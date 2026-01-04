import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef } from "react";
import MessageStatus from "../common/MessageStatus";
import ImageMessage from "./ImageMessage";
import dynamic from "next/dynamic";
import { useState } from "react";

const VoiceMessage = dynamic(() => import("./VoiceMessage"), {
  ssr: false,
});

function ChatContainer() {
  const [{ messages, currentChatUser, userInfo, searchQuery, searchMatches, searchIndex }, dispatch] = useStateProvider();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [ , setLocal ] = useState();
  const messageRefs = useRef([]);

  const scrollToBottom = () => {
    // prefer scrolling the messages container itself to avoid page jump
    const container = messagesContainerRef.current;
    if (container) {
      try {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        return;
      } catch (e) {
        // fallback
        container.scrollTop = container.scrollHeight;
        return;
      }
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    // ensure scroll runs after DOM paint
    const id = requestAnimationFrame(() => scrollToBottom());
    return () => cancelAnimationFrame(id);
  }, [messages]);

  // use reducer-backed search state; no window events

  useEffect(() => {
    if (!searchQuery) {
      dispatch({ type: reducerCases.SET_SEARCH_RESULTS, matches: [] });
      dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: 0 });
      return;
    }

    const q = searchQuery.toLowerCase();
    const found = [];
    messages.forEach((m, idx) => {
      if (m.type === "text" && m.message && m.message.toLowerCase().includes(q)) {
        found.push(idx);
      }
    });

    dispatch({ type: reducerCases.SET_SEARCH_RESULTS, matches: found });
    dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: found.length ? 0 : 0 });
    // force local update if needed
    setLocal(found.length);
  }, [searchQuery, messages]);

  useEffect(() => {
    if (!searchMatches || searchMatches.length === 0) return;
    const idx = searchMatches[searchIndex];
    const ref = messageRefs.current[idx];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchIndex, searchMatches]);

  return (
    <div ref={messagesContainerRef} className="h-[80vh] w-full relative grow overflow-auto custom-scrollbar">
      <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 right-0 z-0"></div>
      <div className="mx-10 my-6 relative bottom-0 left-0 z-40">
        <div className="flex w-full">
          <div className="flex flex-col justify-end w-full gap-1">
            {messages.map((message, index) => (
              <div
                ref={(el) => (messageRefs.current[index] = el)}
                key={message.id || message.temp_id || index}
                className={`flex w-full px-4 ${
                  message.sender_id === currentChatUser.id
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                {/* incoming avatar */}
                {message.sender_id === currentChatUser.id && (
                  <div className="mr-2 mt-1">
                    <img
                      src={currentChatUser?.profile_image || "/default_avatar.png"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                )}

                {message.type === "text" && (
                  <div
                    className={`text-white px-3 py-2 text-small rounded-md flex flex-col z-30 gap-2 max-w-[60%] ${
                      message.sender_id === currentChatUser.id
                        ? "bg-incoming-background"
                        : "bg-outgoing-background"
                    } ${searchQuery && message.message && message.message.toLowerCase().includes(searchQuery.toLowerCase()) ? "ring-2 ring-yellow-400" : ""}`}
                  >
                    <div className="break-all">
                      {searchQuery && message.message && message.message.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                        (() => {
                          const parts = [];
                          const text = message.message;
                          const q = searchQuery;
                          let start = 0;
                          const lower = text.toLowerCase();
                          let idx = lower.indexOf(q.toLowerCase(), start);
                          while (idx !== -1) {
                            if (idx > start) parts.push(text.slice(start, idx));
                            parts.push(<span key={start + idx} className="bg-yellow-300 text-black">{text.slice(idx, idx + q.length)}</span>);
                            start = idx + q.length;
                            idx = lower.indexOf(q.toLowerCase(), start);
                          }
                          if (start < text.length) parts.push(text.slice(start));
                          return parts;
                        })()
                      ) : (
                        message.message
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-bubble-meta text-[11px] text-white/60">
                        {calculateTime?.(message.created_at) || ""}
                      </span>
                      {message.sender_id === userInfo.id && (
                        <MessageStatus status={message.message_status} />
                      )}
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

                {/* outgoing avatar placeholder (optional) */}
                {message.sender_id !== currentChatUser.id && (
                  <div className="ml-2 mt-1 invisible w-8 h-8" />
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
