import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import React, { useEffect, useState } from "react";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import ChatLIstItem from "./ChatLIstItem";

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
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center gap-12 text-white">
          <BiArrowBack
            className="cursor-pointer text-xl"
            onClick={() =>
              dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })
            }
          />
          <span>New Chat</span>
        </div>
      </div>
      <div className="bg-search-input-container-background h-full flex-auto overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex items-center gap-5 px-3 py-1 rounded-lg grow mx-4">
            <div>
              <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-lg" />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search Contacts"
                className="bg-transparent text-sm focus:outline-none text-white w-full"
              />
            </div>
          </div>
        </div>
        {Object.entries(contacts).map(([initialLetter, userList], index) => (
          <div key={index} className="px-4">
            <div className="text-teal-light pl-2 py-3 font-semibold">
              {initialLetter}
            </div>
            {
              userList.map((user) => (
                <ChatLIstItem
                  data={user}
                  isContactPage={true}
                  key={user.id}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactsList;
