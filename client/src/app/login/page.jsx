"use client";

import Image from "next/image";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import apiClient from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [, dispatch] = useStateProvider();
  const [loading, setLoading] = useState(false);

  // Handle user registration/check after successful auth
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      handleUserCheck(session.user);
    }
  }, [status, session]);

  const handleUserCheck = async (user) => {
    try {
      const { name, email, image } = user;

      // Store session data in localStorage for API calls
      if (session?.user?.idToken) {
        localStorage.setItem("authToken", session.user.idToken);
      }

      console.log("Checking user in database:", email);
      const res = await apiClient.post("auth/check-user", { email });

      if (res.data.exists) {
        console.log("User exists, redirecting to home");
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: res.data.user,
        });
        router.replace("/");
      } else {
        console.log("New user, redirecting to onboarding");
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            name,
            email,
            profile_image: image,
          },
        });
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("User check error:", error);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || status === "loading") return;

    setLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Show loading if already authenticated and processing
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-panel-header-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-panel-header-background">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image
          unoptimized
          src="/whatsapp.gif"
          alt="Instant"
          width={300}
          height={300}
          priority
        />
        <span className="text-7xl font-semibold">Instant</span>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className={`flex items-center gap-5 rounded-lg bg-search-input-container-background p-5 text-white transition hover:shadow-lg ${
          loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        {loading ? (
          <>
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
            <span className="text-xl font-medium">Signing in...</span>
          </>
        ) : (
          <>
            <FcGoogle size={28} />
            <span className="text-xl font-medium">Login with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
