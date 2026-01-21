import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Avatar from "../common/Avatar";
import { Phone, Video, Search, ArrowLeft, X, ChevronUp, ChevronDown } from "lucide-react";
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
      className="h-14 sm:h-16 px-3 sm:px-4 flex items-center justify-between border-b border-border bg-card shrink-0 relative z-50"
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

      {/* Floating search bar (same UI as instant-chat) */}
      {!isMobile && (
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute left-0 right-0 top-full overflow-hidden z-50"
            >
              <div className="bg-transparent shadow-lg transition-shadow duration-200 ease-out px-2">
                <div className="bg-card flex items-center gap-0 mt-2">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={(el) => {
                        if (el && showSearch) el.focus();
                      }}
                      placeholder="Search in conversation..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          onNext();
                        }
                      }}
                      className="pl-9 pr-24 bg-transparent border border-border rounded-md w-full transition-all duration-150 ease-out focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />

                    {/* prev/next + counter - placed inside input on the right */}
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        aria-label="Previous result"
                        onClick={onPrev}
                        className={`p-1 rounded text-muted-foreground hover:text-foreground ${!searchMatches?.length ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <ChevronUp size={14} />
                      </button>

                      <div className="text-[12px] text-muted-foreground min-w-[36px] text-center">
                        {searchMatches?.length ? `${(searchIndex || 0) + 1}/${searchMatches.length}` : `0/0`}
                      </div>

                      <button
                        aria-label="Next result"
                        onClick={onNext}
                        className={`p-1 rounded text-muted-foreground hover:text-foreground ${!searchMatches?.length ? "opacity-40 pointer-events-none" : ""}`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <button
                      aria-label="Close search"
                      onClick={onCloseSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default ChatHeader;
