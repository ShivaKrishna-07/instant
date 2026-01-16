"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
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
  const [{ contactsPage }] = useStateProvider();
  const [pageType, setPageType] = useState("default");
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

  return (
    <div className={`h-screen min-h-0 flex flex-col bg-card ${"w-72 xl:w-80 border-r border-border shrink-0"}`}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-0.5 sm:gap-1 relative">
            <ThemeToggle />
            <Button variant="icon" size="iconSm" onClick={() => setPageType("new-chat")}>
              <Plus size={18} />
            </Button>
            <div ref={menuRef} className="relative">
              <Button variant="icon" size="iconSm" onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical size={18} />
              </Button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-48 z-50"
                  >
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                    >
                      <BiLogOut className="text-xl" />
                      <span>Logout</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="">
            <SearchBar className="pl-0" />
          </div>
        </div>
      </div>

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
