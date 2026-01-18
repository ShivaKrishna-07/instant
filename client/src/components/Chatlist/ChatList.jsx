"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Avatar from "../common/Avatar";
import { Search, Plus, MoreVertical } from "lucide-react";
import { BiLogOut } from "react-icons/bi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatListHeader from "./ChatListHeader";
import SearchBar from "./SearchBar";
import List from "./List";
import { useStateProvider } from "@/context/StateContext";
import ContactsList from "./ContactsList";

function ChatList() {
  const [{ contactsPage, currentChatUser, userInfo }] = useStateProvider();
  const [pageType, setPageType] = useState("default");
  const [isNarrow, setIsNarrow] = useState(false);
  const isMobile = pageType !== "default";
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (contactsPage) {
      setPageType("all-contacts");
    } else {
      setPageType("default");
    }
  }, [contactsPage]);

  // Track narrow screen sizes so we can hide the sidebar when a chat is open
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.clear();
      await signOut({ redirect: false, callbackUrl: "/login" });
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.replace("/login");
    }
  };

  // Hide the sidebar on narrow screens when a chat is active so the chat fills the viewport
  const hideOnMobile = isNarrow && !!currentChatUser;

  return (
    <div className={`h-screen min-h-0 flex flex-col bg-card ${hideOnMobile ? 'hidden' : isNarrow ? 'absolute inset-0 z-40 w-full' : 'w-72 xl:w-80 border-r border-border shrink-0'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="p-3 sm:p-4 border-b border-border shrink-0"
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-0.5 sm:gap-1 relative">
            <ThemeToggle />
            <Button variant="icon" size="iconSm" onClick={() => setPageType("new-chat") }>
              <Plus size={18} />
            </Button>
              <Button variant="icon" size="iconSm" onClick={() => router.push('/profile')} className="p-0">
                <Avatar type="xs" image={userInfo?.profile_image || '/default_avatar.png'} />
              </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchBar />
        </div>
      </motion.div>

      {/* Contact list */}
      {pageType === "default" ? (
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          <List />
        </div>
      ) : (
        <div className="flex-1 p-0 min-h-0">
          <ContactsList />
        </div>
      )}
    </div>
  );
}

export default ChatList;
