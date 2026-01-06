'use client'
import { useState, useRef, useEffect } from "react";
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
          
          {showDropdown && (
            <div className="absolute right-0 top-8 bg-dropdown-background rounded-md shadow-lg py-2 z-50 min-w-[150px]">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-background-default-hover text-white transition-colors"
              >
                <BiLogOut className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatListHeader;
