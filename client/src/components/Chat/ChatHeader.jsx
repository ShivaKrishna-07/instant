import React from "react";
import Avatar from "../common/Avatar";
import {
  MdCall,
  MdVideocam,
  MdSearch,
  MdMoreVert,
} from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";

function ChatHeader() {
  const [{currentChatUser}] = useStateProvider();
  return <div className="h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
    <div className="flex items-center justify-center gap-6">
      <Avatar type='sm' image={currentChatUser?.profile_image || "/default_avatar.png"} />
       <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name || "John Doe"}</span>
          <span className="text-secondary text-sm">
            online/offline
          </span>
        </div>
    </div>
    <div className="flex gap-5">
        <MdCall className="text-panel-header-icon cursor-pointer text-xl" />
        <MdVideocam className="text-panel-header-icon cursor-pointer text-xl" />
        <MdSearch className="text-panel-header-icon cursor-pointer text-xl" />
        <MdMoreVert className="text-panel-header-icon cursor-pointer text-xl" />
      </div>
  </div>;
}

export default ChatHeader;
