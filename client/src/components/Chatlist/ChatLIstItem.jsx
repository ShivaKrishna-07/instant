import React from "react";
import { motion } from "framer-motion";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";

function ChatLIstItem({ data, isContactPage = false }) {
  const [{ userInfo, currentChatUser, contactsPage }, dispatch] = useStateProvider();

  const handleContactClick = () => {
    const partnerId = data?.partnerid || data?.partnerId || data?.id;
    if (currentChatUser?.id === partnerId) return;

    const chatUser = {
      id: partnerId,
      name: data?.name,
      profile_image: data?.profile_image,
    };

    dispatch({ type: reducerCases.SET_CURRENT_CHAT_USER, user: chatUser });
    if (contactsPage) dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const lastMessagePreview = (() => {
    if (!data) return "";
    if (data.type === "image") return "Image";
    if (data.type === "audio") return "Voice message";
    return data.message || data.about || "";
  })();

  const timeText = data?.lastmessageat ? calculateTime(data.lastmessageat) : "";
  const showStatus = data?.last_sender_id && userInfo?.id && data.last_sender_id === userInfo.id;

  return (
    <motion.button
      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.06)" }}
      whileTap={{ scale: 0.98 }}
      onClick={handleContactClick}
      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-colors text-left cursor-pointer`}
    >
      <div className="relative shrink-0">
        {data?.profile_image ? (
          // prefer simple <img> for server-provided urls
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.profile_image}
            alt={data.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">N</span>
          </div>
        )}

        {data?.unreadcount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-medium text-primary-foreground">{data.unreadcount}</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate">{data?.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{timeText}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessagePreview}</p>
      </div>

      {/* optional message status */}
      {showStatus && <div className="ml-2"><MessageStatus status={data.message_status} /></div>}
    </motion.button>
  );
}

export default ChatLIstItem;
