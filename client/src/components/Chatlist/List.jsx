import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "@/utils/api";
import ChatLIstItem from "./ChatLIstItem";
import Loader from "@/components/ui/loader";
import { Plus } from "lucide-react";
import { useStateProvider } from '@/context/StateContext';
import { reducerCases } from '@/context/constants';
import { Button } from "../ui/button";

function List({ searchQuery = "" }) {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [, dispatch] = useStateProvider();

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const name = (c?.name || "").toLowerCase();
      const about = (c?.about || "").toLowerCase();
      const last = ((c?.message || c?.lastmessage || c?.lastMessage || "") + "").toLowerCase();
      return name.includes(q) || about.includes(q) || last.includes(q);
    });
  }, [conversations, searchQuery]);

  useEffect(() => {
    let mounted = true;
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/conversations');
        const data = res?.data || res || {};
        const convs = data.conversations || data || [];
        if (mounted) setConversations(convs);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchConversations();
    return () => { mounted = false };
  }, []);

  return (
    <div className="bg-search-input-container-background flex-1 overflow-auto min-h-0 custom-scrollbar relative">

      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <Loader message="Loading conversations..." />
        </div>
      ) : (
        <div>
          {filteredConversations.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <Button
                onClick={() => dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })}
                aria-label="New chat"
                size="sm"
              >
                <Plus size={16} />
                New
              </Button>
            </div>
          ) : (
            <div>
              {filteredConversations.map((c, idx) => (
                <motion.div
                  key={c.partnerid || c.partnerId || c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <ChatLIstItem data={c} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default List;
