import React, { useState, useEffect } from "react";
import Avatar from "../common/Avatar";
import { MdCall, MdVideocam, MdSearch, MdMoreVert } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import SearchBar from "./SearchBar";
import { toast } from "react-hot-toast";

function ChatHeader() {
  const [{ currentChatUser, searchMatches = [], searchIndex = 0, searchQuery = "", socket }, dispatch] = useStateProvider();
  const [showSearch, setShowSearch] = useState(false);

  const onSearchChange = (q) => {
    dispatch({ type: reducerCases.SET_SEARCH_QUERY, query: q });
  };

  const onCloseSearch = () => {
    setShowSearch(false);
    dispatch({ type: reducerCases.SET_SEARCH_QUERY, query: "" });
    dispatch({ type: reducerCases.SET_SEARCH_RESULTS, matches: [] });
    dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: 0 });
  };

  const onNext = () => {
    if (!searchMatches || searchMatches.length === 0) return;
    const next = (searchIndex + 1) % searchMatches.length;
    dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: next });
  };

  const onPrev = () => {
    if (!searchMatches || searchMatches.length === 0) return;
    const prev = (searchIndex - 1 + searchMatches.length) % searchMatches.length;
    dispatch({ type: reducerCases.SET_SEARCH_INDEX, index: prev });
  };

  // presence state (derived from socket only)
  // null = unknown / not checked, true = online, false = offline
  const [online, setOnline] = useState(null);

  // query presence via socket callback when chat user changes
  useEffect(() => {
    if (!currentChatUser?.id) {
      setOnline(null);
      return;
    }

    if (!socket || !socket.current) {
      // socket not ready -> unknown status
      setOnline(null);
      return;
    }

    try {
      socket.current.emit('is-online', currentChatUser.id, (res) => {
        setOnline(res && !!res.online ? true : false);
      });
    } catch (e) {
      setOnline(null);
    }

    // subscribe to real-time updates
    const handleOnline = (userId) => {
      if (userId === currentChatUser?.id) setOnline(true);
    };
    const handleOffline = (userId) => {
      if (userId === currentChatUser?.id) setOnline(false);
    };

    socket.current.on('user-online', handleOnline);
    socket.current.on('user-offline', handleOffline);

    return () => {
      try {
        socket.current.off('user-online', handleOnline);
        socket.current.off('user-offline', handleOffline);
      } catch (e) {}
    };
  }, [currentChatUser, socket]);

  useEffect(() => {
    const handler = (e) => {
      // Close on Escape
      if (e.key === "Escape") {
        if (showSearch) onCloseSearch();
        return;
      }

      // Open search on Ctrl/Cmd + Shift + F
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch]);

  return (
    <div className="relative h-16 px-4 py-3 flex justify-between items-center bg-panel-header-background z-10">
      <div className="flex items-center justify-center gap-6">
        <Avatar type="sm" image={currentChatUser?.profile_image || "/default_avatar.png"} />
        <div className="flex flex-col">
          <span className="text-primary-strong">{currentChatUser?.name || "John Doe"}</span>
          <span className="text-secondary text-sm">
            {online === null ? "" : online ? "online" : "offline"}
          </span>
        </div>
      </div>
      <div className="flex gap-5">
        <MdCall className="text-panel-header-icon cursor-pointer text-xl" />
        <MdVideocam className="text-panel-header-icon cursor-pointer text-xl" onClick={() => {
          // trigger start-call event to initiate WebRTC flow
          const targetId = currentChatUser?.id;
          if (targetId) window.dispatchEvent(new CustomEvent('start-call', { detail: { targetId } }));
        }} />
        <MdSearch className="text-panel-header-icon cursor-pointer text-xl" onClick={() => setShowSearch(!showSearch)} />
        <MdMoreVert className="text-panel-header-icon cursor-pointer text-xl" />
      </div>

      <SearchBar
        visible={showSearch}
        onClose={onCloseSearch}
        onSearchChange={onSearchChange}
        onNext={onNext}
        onPrev={onPrev}
        count={searchMatches?.length || 0}
        index={searchIndex}
        value={searchQuery}
      />
    </div>
  );
}

export default ChatHeader;
