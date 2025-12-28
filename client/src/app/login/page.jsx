"use client";

import Image from "next/image";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/config/firebase";
import apiClient from "@/utils/api";
import { useRouter } from "next/navigation";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GiConsoleController } from "react-icons/gi";

const page = () => {
  const router = useRouter();
  const [{}, dispatch] = useStateProvider();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    const { displayName, email, photoURL, uid } = user;

    try {
      const res = await apiClient.post("auth/check-user", {
        email,
      });
      console.log("RES", res);
      if (res.data.data.exists) {
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: res.data.data.id,
            name: displayName,
            email: email,
            profilePic: photoURL,
          },
        });
        router.push("/");
      } else {
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            name: displayName,
            email: email,
            profilePic: photoURL,
          },
        });
        router.push("/onboarding");
      }
    } catch (error) {}
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
