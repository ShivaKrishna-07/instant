"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";
import apiClient from "@/utils/api";
import { useRouter } from "next/navigation";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

const page = () => {
  const router = useRouter();
  const [state, dispatch] = useStateProvider();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const { displayName, email, photoURL, uid } = user;

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      const res = await apiClient.post("auth/check-user", {
        email,
        token: idToken,
      });

      if (res.data.exists) {
        // Backend sets cookie; fetch full user from backend and store in context
        try {
          const userRes = await apiClient.get('/auth/get-user');
          if (userRes?.data?.user) {
            dispatch({ type: reducerCases.SET_USER_INFO, userInfo: userRes.data.user });
            dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
            router.replace('/');
            return;
          }
        } catch (err) {
          // fallback: set minimal info if backend get-user fails
        }

        dispatch({ type: reducerCases.SET_USER_INFO, userInfo: { id: res.data.data.id, name: displayName, email, profilePic: photoURL } });
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
        router.replace('/');
      } else {
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
        dispatch({ type: reducerCases.SET_USER_INFO, userInfo: { name: displayName, email, profilePic: photoURL } });
        // Save idToken temporarily so onboarding can send it to server (session-scoped)
        try {
          sessionStorage.setItem('idToken', idToken);
        } catch (e) {}
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Login error', error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image
          unoptimized
          src="/whatsapp.gif"
          alt="whatsapp"
          width={300}
          height={300}
        />
        <span className="text-7xl">Instant</span>
      </div>
      <button
        onClick={handleLogin}
        className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg cursor-pointer hover:shadow-lg"
      >
        <FcGoogle size={30} />
        <span className="text-2xl text-white">Login with Google</span>
      </button>
    </div>
  );
};

export default page;
