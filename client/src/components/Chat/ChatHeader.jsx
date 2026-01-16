import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Avatar from "../common/Avatar";
import { Phone, Video, Search, ArrowLeft } from "lucide-react";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import SearchBar from "./SearchBar";

function ChatHeader({ isMobile = false, onBackClick }) {
  const [
    {
      currentChatUser,
      searchMatches = [],
      searchIndex = 0,
      searchQuery = "",
      socket,
    },
    dispatch,
  ] = useStateProvider();

  const [showSearch, setShowSearch] = useState(false);

  /* ---------------- Search logic (unchanged) ---------------- */
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
    if (!searchMatches.length) return;
    dispatch({
      type: reducerCases.SET_SEARCH_INDEX,
      index: (searchIndex + 1) % searchMatches.length,
    });
  };

  const onPrev = () => {
    if (!searchMatches.length) return;
    dispatch({
      type: reducerCases.SET_SEARCH_INDEX,
      index: (searchIndex - 1 + searchMatches.length) % searchMatches.length,
    });
  };

  /* ---------------- Presence logic (unchanged) ---------------- */
  const [online, setOnline] = useState(null);

  useEffect(() => {
    if (!currentChatUser?.id || !socket?.current) {
      setOnline(null);
      return;
    }

    socket.current.emit("is-online", currentChatUser.id, (res) => {
      setOnline(!!res?.online);
    });

    const handleOnline = (id) =>
      id === currentChatUser.id && setOnline(true);
    const handleOffline = (id) =>
      id === currentChatUser.id && setOnline(false);

    socket.current.on("user-online", handleOnline);
    socket.current.on("user-offline", handleOffline);

    return () => {
      socket.current.off("user-online", handleOnline);
      socket.current.off("user-offline", handleOffline);
    };
  }, [currentChatUser, socket]);

  /* ---------------- Keyboard shortcuts (unchanged) ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && showSearch) onCloseSearch();

      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch]);

  /* ---------------- UI (copied from ChatArea header) ---------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 sm:h-16 px-3 sm:px-4 flex items-center justify-between border-b border-border bg-card shrink-0 relative z-10"
    >
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {isMobile && (
          <Button
            variant="icon"
            size="iconSm"
            className="shrink-0"
            onClick={onBackClick}
          >
            <ArrowLeft size={20} />
          </Button>
        )}

        <Avatar
          type="sm"
          image={currentChatUser?.profile_image || "/default_avatar.png"}
        />

        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base truncate">
            {currentChatUser?.name || "John Doe"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {online === null ? "" : online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <Button
          variant="icon"
          size="icon"
          className="w-9 h-9 sm:w-10 sm:h-10"
          onClick={() => {
            const targetId = currentChatUser?.id;
            if (targetId)
              dispatch({
                type: reducerCases.START_CALL,
                payload: { targetId, kind: "voice" },
              });
          }}
        >
          <Phone size={18} className="sm:w-5 sm:h-5" />
        </Button>

        <Button
          variant="icon"
          size="icon"
          className="w-9 h-9 sm:w-10 sm:h-10"
          onClick={() => {
            const targetId = currentChatUser?.id;
            if (targetId)
              dispatch({
                type: reducerCases.START_CALL,
                payload: { targetId, kind: "video" },
              });
          }}
        >
          <Video size={18} className="sm:w-5 sm:h-5" />
        </Button>

        <Button
          variant="icon"
          size="icon"
          className="w-9 h-9 sm:w-10 sm:h-10 hidden sm:flex"
          onClick={() => setShowSearch((v) => !v)}
        >
          <Search size={18} className="sm:w-5 sm:h-5" />
        </Button>
      </div>

      <SearchBar
        visible={showSearch}
        onClose={onCloseSearch}
        onSearchChange={onSearchChange}
        onNext={onNext}
        onPrev={onPrev}
        count={searchMatches.length}
        index={searchIndex}
        value={searchQuery}
      />
    </motion.div>
  );
}

export default ChatHeader;
