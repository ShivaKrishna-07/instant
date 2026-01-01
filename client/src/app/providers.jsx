"use client";

import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import { Toaster } from "react-hot-toast";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import apiClient from "@/utils/api";

export default function Providers({ children }) {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <InnerFetch>
        {children}
      </InnerFetch>
    </StateProvider>
  );
}

function InnerFetch({ children }) {
  const [state, dispatch] = useStateProvider();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      if (state?.userInfo) return;
      try {
        const res = await apiClient.get('/auth/get-user');
        if (res.data?.user) {
          dispatch({ type: reducerCases.SET_USER_INFO, userInfo: res.data.user });
        }
      } catch (err) {
        // silent fail — user not logged in or token invalid
      }
    };

    fetchUser();
    const handler = () => router.replace('/login');
    if (typeof window !== 'undefined') window.addEventListener('api:unauthorized', handler);

    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('api:unauthorized', handler);
    };
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
