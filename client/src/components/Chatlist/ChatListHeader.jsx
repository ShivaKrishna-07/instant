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
  const [showDropdown, setShowDropdown] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center">
      <div className="cursor-pointer">
        <Avatar type='sm' image={userInfo?.profile_image || "/default_avatar.png"} />
      </div>
      <div className="flex gap-6 relative">
        <BsFillChatLeftTextFill 
          className="text-panel-header-icon cursor-pointer text-xl" 
          title="New Chat" 
          onClick={handleAllContactsPage} 
        />
        <div ref={dropdownRef} className="relative">
          <BsThreeDotsVertical
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Menu"
            onClick={() => setShowDropdown(!showDropdown)}
          />

          <AnimatePresence>
            {showDropdown && (
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
                    setShowDropdown(false);
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
  );
}

export default ChatListHeader;
