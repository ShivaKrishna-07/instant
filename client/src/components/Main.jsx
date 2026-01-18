"use client"
import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import ChatSkeleton from "./Chat/ChatSkeleton";
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

  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(()=>{
    const getMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await apiClient.get(`/messages/get-messages/${userInfo.id}/${currentChatUser.id}`);
        dispatch({ type: reducerCases.SET_MESSAGES, messages: res.data.messages });
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setMessagesLoading(false);
      }
    }
    if(currentChatUser?.id && userInfo?.id){
      getMessages();
    }
  }, [currentChatUser]);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <ChatList />
      <div className="flex-1 min-h-0 flex flex-col">
        {currentChatUser ? (
          messagesLoading ? (
            <ChatSkeleton />
          ) : (
            <Chat
              isMobile={isNarrow}
              onBackClick={() => dispatch({ type: reducerCases.SET_CURRENT_CHAT_USER, user: null })}
            />
          )
        ) : (
          <Empty />
        )}
      </div>
      <CallManager />
    </div>
  );
}

export default Main;
