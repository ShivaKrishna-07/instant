import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import apiClient from "@/utils/api";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

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
    <div className="bg-search-input-container-background flex-1 overflow-auto min-h-0 custom-scrollbar">
      {loading ? (
        <div className="p-4 text-secondary">Loading...</div>
      ) : (
        conversations.map((c, idx) => (
          <motion.div
            key={c.partnerid || c.partnerId || c.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <ChatLIstItem data={c} />
          </motion.div>
        ))
      )}
    </div>
  );
}

export default List;
