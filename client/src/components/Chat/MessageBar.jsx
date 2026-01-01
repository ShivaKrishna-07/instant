import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import React, { useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";

function MessageBar() {
  const [{userInfo, currentChatUser}, dispatch] = useStateProvider();
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    alert("send message: " + message);
    if (message.trim() === "") return;
    
    try {
      const { data } = await apiClient.post('/messages/add-message', {
        message,
        from: userInfo.id,
        to: currentChatUser.id,
      });
      dispatch({ type: reducerCases.SET_MESSAGES, messages: data.messages });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  return (
    <div className="bg-panel-header-background h-20 px-4 flex items-center gap-6 relative">
      {/* Left icons */}
      <div className="flex gap-5">
        <BsEmojiSmile
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Emoji"
        />

        <ImAttachment
          className="text-panel-header-icon cursor-pointer text-xl"
          title="Attach File"
        />
      </div>

      {/* Input */}
      <div className="flex-1 full rounded-lg h-10 flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          className="bg-input-background text-sm h-10 px-5 text-white py-5 w-full rounded-lg focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="flex w-10 items-center justify-center">
        <button onClick={sendMessage}>
          <MdSend className="text-panel-header-icon cursor-pointer text-xl" title="Send" />
        </button>
      </div>
    </div>
  );
}

export default MessageBar;
