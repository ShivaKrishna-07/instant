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
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import FloatingBubbles from "@/components/FloatingBubbles";
import { Button } from "@/components/ui/button";

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
      const res = await apiClient.post("/auth/check-user", { email });

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
        callbackUrl: "/login",
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
    <div className="min-h-screen flex">
      {/* Left side - Login */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 relative"
      >
        {/* Theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-10">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <Logo size="lg" />
          </div>

          {/* Welcome text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Welcome to Instant</h1>
            <p className="text-muted-foreground text-lg">Fast, minimal, premium messaging for everyone.</p>
          </motion.div>

          {/* Google login button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
          <Button
              variant="google"
              size="xl"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </motion.div>

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-sm text-muted-foreground text-center lg:text-left"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="hidden lg:flex w-1/2 bg-card relative overflow-hidden"
      >
        <FloatingBubbles />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/login-visual.png"
            alt="Instant messaging"
            className="w-full h-full object-cover opacity-40"
            width={100}
            height={100}
          />
        </div>
      </motion.div>
    </div>
  );
}
