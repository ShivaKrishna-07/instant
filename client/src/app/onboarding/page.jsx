"use client";

import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import { toast } from "react-hot-toast";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    about: "",
    profileImage: "/default_avatar.png",
  });

  // useEffect(() => {
  //   if(!newUser && !userInfo?.email) router.push("/login");
  //   else if(!newUser && userInfo?.email) router.push("/");
  // }, [userInfo, newUser, router]);

  const onBoardUserHandler = async () => {
    const { name, about, profileImage } = formData;
    if (!name || name.trim() === "" ) {
      toast("Display Name is required");
      return;
    }
    if(name.length < 3) {
      toast("Display Name must be at least 3 characters long");
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('idToken') : null;
      const res = await apiClient.post("/auth/onboard-user", {
        email: userInfo.email,
        name: name.trim(),
        about: about.trim(),
        profileImage,
        token
      });
      dispatch({ type: "SET_NEW_USER", newUser: false });
      dispatch({ type: "SET_USER_INFO", userInfo: {
        name,
        about,
        email: userInfo.email,
        profileImage,
      } });
      router.push("/");
      try { sessionStorage.removeItem('idToken'); } catch (e) {}
      toast("Profile created successfully!");
    } catch (error) {
      toast("Failed to create profile. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center max-h-screen max-w-screen bg-panel-header-background text-white">
      <div className="flex items-center justify-center">
        <Image
          src="/whatsapp.gif"
          alt="WhatsApp Logo"
          width={200}
          height={200}
        />
        <span className="text-7xl ">Instant</span>
      </div>
      <h2 className="text-2xl">Create your Profile</h2>
      <div className="flex mt-6 gap-6">
        <div className="flex flex-col items-center justify-center gap-6 mt-5">
          <Input
            name="Display Name"
            label
            state={formData.name}
            setState={(value) => setFormData({ ...formData, name: value })}
          />
          <Input
            name="About"
            label
            state={formData.about}
            setState={(value) => setFormData({ ...formData, about: value })}
          />
          <div className="flex items-center justify-center">
            <button className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg cursor-pointer hover:shadow-lg" onClick={onBoardUserHandler}>
              Create Profile
            </button>
          </div>
        </div>
        <div>
          <Avatar
            type="xl"
            image={formData.profileImage}
            setImage={(value) =>
              setFormData({ ...formData, profileImage: value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default page;
