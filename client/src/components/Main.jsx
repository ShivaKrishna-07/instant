"use client"
import React, { useEffect, useRef } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import apiClient from "@/utils/api";
import { io } from "socket.io-client";
import dynamic from 'next/dynamic';

const CallManager = dynamic(() => import('./Call/CallManager'), { ssr: false });

function Main() {
  const [{userInfo, currentChatUser}, dispatch] = useStateProvider();
  const socket = useRef();
  console.log("userInfo in Main:", userInfo);
  useEffect(()=>{
    if(userInfo && userInfo.id){
      socket.current = io(process.env.NEXT_PUBLIC_BASE_API_URL);
      
      socket.current.on('connect', () => {
        socket.current.emit("add-user", userInfo.id);
      });

      socket.current.on("msg-receive", (data)=>{
        dispatch({ 
          type: reducerCases.ADD_MESSAGE, 
          newMessage: {
            ...data.message,
            sender_id: data.from
          }
        });
      });
      
      dispatch({ type: reducerCases.SET_SOCKET, socket: socket });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo, dispatch]);

  useEffect(()=>{
    const getMessages = async () => {
      const res = await apiClient.get(`/messages/get-messages/${userInfo.id}/${currentChatUser.id}`);
      dispatch({ type: reducerCases.SET_MESSAGES, messages: res.data.messages });
    }
    if(currentChatUser?.id && userInfo?.id){
      getMessages();
    }
  }, [currentChatUser]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <ChatList />
      <div className="flex-1 min-h-0 flex flex-col">
        {currentChatUser ? <Chat /> : <Empty />}
      </div>
      <CallManager />
    </div>
  );
}

export default Main;
