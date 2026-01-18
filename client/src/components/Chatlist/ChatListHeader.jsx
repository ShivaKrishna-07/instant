"use client"
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Avatar from "../common/Avatar";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

function ChatListHeader() {
  const [{userInfo}, dispatch] = useStateProvider();
  const dropdownRef = useRef(null);
  const router = useRouter();
  
  const handleAllContactsPage = () => {
    dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE });
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.clear();
      
      // Sign out using NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: "/login" 
      });
      
      // Redirect to login
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even on error
      router.replace("/login");
    }
  };

  // ensure ref exists for future use
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type='sm' image={userInfo?.profile_image || "/default_avatar.png"} />
      </div>
      <div className="flex gap-6 items-center">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New Chat"
          onClick={handleAllContactsPage}
        />

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => router.push("/profile")}
            title="Profile"
            className="w-9 h-9 rounded-full overflow-hidden border border-border"
          >
            <Avatar type="sm" image={userInfo?.profile_image || "/default_avatar.png"} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatListHeader;
