import React, { useEffect, useState } from "react";
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
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {loading ? (
        <div className="p-4 text-secondary">Loading...</div>
      ) : (
        conversations.map((c) => (
          <ChatLIstItem key={c.partnerid || c.partnerId} data={c} />
        ))
      )}
    </div>
  );
}

export default List;
