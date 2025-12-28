"use client";

import { StateProvider } from "@/context/StateContext";
import reducer, { initialState } from "@/context/StateReducers";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      {children}
      <Toaster position="top-right" />
    </StateProvider>
  );
}
