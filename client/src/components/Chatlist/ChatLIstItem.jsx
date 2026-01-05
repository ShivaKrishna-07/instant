import React from "react";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";

function ChatLIstItem({ data, isContactPage = false }) {

  const [{userInfo, currentChatUser, contactsPage}, dispatch] = useStateProvider();

  const handleContactClick = () => {
    const partnerId = data?.partnerid || data?.partnerId || data?.id;
    if (currentChatUser?.id === partnerId) return;

    const chatUser = {
      id: partnerId,
      name: data?.name,
      profile_image: data?.profile_image,
    };

    dispatch({ type: reducerCases.SET_CURRENT_CHAT_USER, user: chatUser });
    if(contactsPage)
      dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const lastMessagePreview = (() => {
    if (!data) return "";
    if (data.type === 'image') return "Image";
    if (data.type === 'audio') return "Voice message";
    return data.message || data.about || "";
  })();

  const timeText = data?.lastmessageat ? calculateTime(data.lastmessageat) : "";

  const showStatus = data?.last_sender_id && userInfo?.id && data.last_sender_id === userInfo.id;

  const partnerId = data?.partnerid || data?.partnerId || data?.id;
  const isActive = currentChatUser?.id === partnerId;

  return (
    <div
      className={`flex cursor-pointer items-center hover:bg-background-default-hover px-3 py-3`}
      onClick={handleContactClick}
    >
      <div className="min-w-fit pr-3">
        <Avatar type="lg" image={data?.profile_image} />
      </div>
      <div className="min-h-full flex flex-col justify-center pr-2 w-full">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-white font-medium">{data?.name}</span>
            <span className="text-secondary line-clamp-1 text-sm mt-1">{lastMessagePreview}</span>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className="text-secondary text-xs">{timeText}</span>
            {data?.unreadcount > 0 ? (
              <div className="bg-primary text-xs text-white rounded-full px-2 py-0.5 mt-2">{data.unreadcount}</div>
            ) : (
              showStatus && <div className="mt-2"><MessageStatus status={data.message_status} /></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatLIstItem;
