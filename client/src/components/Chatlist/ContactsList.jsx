import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";

function ContactsList() {
  const [contacts, setContacts] = useState({});
  const [{}, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const res = await apiClient.get("/auth/get-contacts");
        setContacts(res.data?.usersGroupedByInitialLetter || []);
      } catch (error) {
        console.error("Error fetching contacts: ", error);
      }
    };
    getContacts();
  }, []);

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

        {Object.entries(contacts).map(([initialLetter, userList], index) => (
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
        ))}
      </div>
    </div>
  );
}

export default ContactsList;
