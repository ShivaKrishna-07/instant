"use client";

import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import { Toaster } from "react-hot-toast";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();

  useEffect(() => {
    // Skip fetch on login and onboarding pages
    if (pathname === '/login' || pathname === '/onboarding') return;

    const fetchUser = async () => {
      if (state?.userInfo?.id) return;
      
      try {
        const res = await apiClient.get('/auth/get-user');
        if (res.data?.user) {
          dispatch({ type: reducerCases.SET_USER_INFO, userInfo: res.data.user });
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
                    router.replace('/');
        }
      } catch (err) {
        // Silent fail — user not logged in or token invalid
        // The axios interceptor will handle redirecting to login if needed
        console.log('User not authenticated');
      }
    };

    fetchUser();
    
    // Listen for unauthorized events
    const handler = () => {
      if (pathname !== '/login' && pathname !== '/onboarding') {
        router.replace('/login');
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('api:unauthorized', handler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('api:unauthorized', handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
