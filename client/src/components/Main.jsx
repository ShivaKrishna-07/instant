"use client"
import React, { useEffect } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { useStateProvider } from "@/context/StateContext";
import Chat from "./Chat/Chat";
import apiClient from "@/utils/api";

function Main() {
  const [{userInfo, currentChatUser}, dispatch] = useStateProvider();

  useEffect(()=>{
    const getMessages = async () => {
      const res = await apiClient.get(`/messages/get-messages/${userInfo.id}/${currentChatUser.id}`);
      dispatch({ type: "SET_MESSAGES", messages: res.data.messages });
    }
    if(currentChatUser?.id && userInfo?.id){
      getMessages();
    }
  }, [currentChatUser]);

  return <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-screen overflow-hidden">
    <ChatList />
    { currentChatUser ? <Chat /> : <Empty /> }
  </div>;
}

export default Main;
