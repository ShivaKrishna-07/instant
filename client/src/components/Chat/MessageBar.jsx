import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import PhotoPicker from "../common/PhotoPicker";
import { FaMicrophone } from "react-icons/fa";
import dynamic from "next/dynamic";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Paperclip, Smile } from "lucide-react";
import { Button } from "../ui/button";

const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), {
  ssr: false,
});

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  // handle outside click for emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        event.target.id !== "emoji-open"
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const sendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const { data } = await apiClient.post("/messages/add-message", {
        message,
        from: userInfo.id,
        to: currentChatUser.id,
      });

      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message,
      });

      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: { ...data.message },
        fromSelf: true,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const photoPickerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("from", userInfo.id);
      formData.append("to", currentChatUser.id);

      const { data } = await apiClient.post(
        "/messages/add-image-message",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message,
      });

      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: { ...data.message },
        fromSelf: true,
      });
    } catch (error) {
      console.error("Failed to send image:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
    className="border-t border-border h-18 px-4 flex items-center gap-2 relative bg-card">
      {!showAudioRecorder ? (
        <>
          {isUploading && (
            <div className="absolute inset-0 bg-panel-header-background/90 flex items-center justify-center z-50">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white text-sm">Uploading image...</span>
              </div>
            </div>
          )}
          {/* Left icons */}
          <div className="flex gap-5">
            
            <Button variant="icon" size="icon" className="shrink-0 w-9 h-9 sm:w-10 sm:h-10">
              <Paperclip size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Input */}
          <div className="flex-1 full rounded-lg h-10 flex items-center">
            <Input
              placeholder="Type a message..."
              className="pr-10 text-sm sm:text-base"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              variant="icon"
              size="iconSm"
              className="absolute right-18 top-1/2 -translate-y-1/2"
              title="Emoji"
              id="emoji-open"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >

            <Smile
              size={18}
              />
              </Button>
            {showEmojiPicker && (
              <div
              ref={emojiPickerRef}
              className="absolute bottom-19 right-16 z-40"
              >
                <EmojiPicker
                  onEmojiClick={(e) => setMessage(message + e.emoji)}
                  theme="dark"
                  />
              </div>
            )}
          </div>
          <div className="flex w-10 items-center justify-center">
            <button>
              {message.trim() !== "" ? (
                <MdSend
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Send"
                  onClick={sendMessage}
                />
              ) : (
                <FaMicrophone
                  className="text-panel-header-icon cursor-pointer text-xl"
                  title="Record Audio"
                  onClick={() => setShowAudioRecorder(true)}
                />
              )}
            </button>
          </div>
          <PhotoPicker ref={fileInputRef} onChange={photoPickerChange} />
        </>
      ) : (
        <CaptureAudio hide={() => setShowAudioRecorder(false)} />
      )}
    </motion.div>
  );
}

export default MessageBar;
