import React, { useState, useEffect } from "react";
import Avatar from "../common/Avatar";
import { MdCall, MdVideocam, MdSearch, MdMoreVert } from "react-icons/md";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import SearchBar from "./SearchBar";

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
  const [online, setOnline] = useState(false);
  const [checkingOnline, setCheckingOnline] = useState(false);

  // query presence via socket callback when chat user changes
  useEffect(() => {
    if (!currentChatUser?.id) {
      setOnline(false);
      setCheckingOnline(false);
      return;
    }

    if (!socket || !socket.current) {
      // if socket not ready, show checking until socket connects
      setOnline(false);
      setCheckingOnline(true);
      return;
    }

    setCheckingOnline(true);
    try {
      socket.current.emit('is-online', currentChatUser.id, (res) => {
        setOnline(!!(res && res.online));
        setCheckingOnline(false);
      });
    } catch (e) {
      setOnline(false);
      setCheckingOnline(false);
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
            {checkingOnline ? "checking..." : online ? "online" : "offline"}
          </span>
        </div>
      </div>
      <div className="flex gap-5">
        <MdCall className="text-panel-header-icon cursor-pointer text-xl" />
        <MdVideocam className="text-panel-header-icon cursor-pointer text-xl" />
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
