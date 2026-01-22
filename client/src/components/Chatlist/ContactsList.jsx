import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import React, { useEffect, useState, useMemo } from "react";
import { BiArrowBack } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";
import { motion } from "framer-motion";
import Loader from "@/components/ui/loader";

function ContactsList({ searchQuery = "" }) {
  const [contacts, setContacts] = useState({});
  const [loading, setLoading] = useState(false);
  const [{}, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/auth/get-contacts");
        setContacts(res.data?.usersGroupedByInitialLetter || {});
      } catch (error) {
        console.error("Error fetching contacts: ", error);
      } finally {
        setLoading(false);
      }
    };
    getContacts();
  }, []);

  const flatContacts = useMemo(() => Object.values(contacts).flat(), [contacts]);
  const filtered = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    return flatContacts.filter((user) => {
      const name = (user?.name || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [flatContacts, searchQuery]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-end px-3 py-4">
        <div className="flex items-center gap-4 text-white">
          <BiArrowBack
            className="cursor-pointer text-xl hover:text-teal-light transition"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })
            }
          />
          <span className="font-semibold">New Chat</span>
        </div>
      </div>
      <div
        className="bg-search-input-container-background flex-1 overflow-y-auto min-h-0 custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 96px)', WebkitOverflowScrolling: 'touch' }}
      >
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <Loader message="Loading contacts..." />
          </div>
        ) : searchQuery ? (
          <div className="px-4">
            <div className="text-teal-light pl-2 py-3 font-semibold">Results</div>
            {filtered && filtered.length ? (
              filtered.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                >
                  <ChatLIstItem
                    data={user}
                    isContactPage={true}
                  />
                </motion.div>
              ))
            ) : (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <div className="text-sm text-muted-foreground">No contacts match "{searchQuery}"</div>
              </div>
            )}
          </div>
        ) : (
          Object.entries(contacts).map(([initialLetter, userList], index) => (
            <div key={index} className="px-4">
              <div className="text-teal-light pl-2 py-3 font-semibold">
                {initialLetter}
              </div>
              {userList.map((user, idx) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                >
                  <ChatLIstItem
                    data={user}
                    isContactPage={true}
                  />
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContactsList;
