"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useStateProvider } from "@/context/StateContext";
import apiClient from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload, Image as ImageIcon, X, User } from "lucide-react";
import PhotoPicker from "@/components/common/PhotoPicker";
import CapturePhoto from "@/components/common/CapturePhoto";

import Image from "next/image";

const cartoonAvatars = [
  { id: "1", src: "/assets/avatars/avatar-1.png", name: "Happy Kid" },
  { id: "2", src: "/assets/avatars/avatar-2.png", name: "Cute Cat" },
  { id: "3", src: "/assets/avatars/avatar-3.png", name: "Puppy" },
  { id: "4", src: "/assets/avatars/avatar-4.png", name: "Panda" },
  { id: "5", src: "/assets/avatars/avatar-5.png", name: "Fox" },
  { id: "6", src: "/assets/avatars/avatar-6.png", name: "Bunny" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    about: "",
    profile_image: "",
  });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarLibrary, setShowAvatarLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);
  const fileInputRef = useRef(null);

  const onBoardUserHandler = async () => {
    const { name, about, profile_image } = formData;
    if (!name || name.trim() === "") {
      toast("Display Name is required");
      return;
    }
    if (name.trim().length < 3) {
      toast("Display Name must be at least 3 characters long");
      return;
    }

    try {
      const res = await apiClient.post("/auth/onboard-user", {
        email: userInfo.email,
        name: name.trim(),
        about: about.trim(),
        profile_image: profile_image === "" ? "/default_avatar.png" : profile_image,
      });

      if (res.data?.user) {
        dispatch({ type: "SET_USER_INFO", userInfo: res.data.user });
        dispatch({ type: "SET_NEW_USER", newUser: false });
        toast("Profile created successfully!");
        router.push("/");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast("Failed to create profile. Please try again.");
    }
  };

  const handleContinue = () => {
    if (step === 1 && formData.name.trim()) {
      setStep(2);
    } else if (step === 2) {
      onBoardUserHandler();
    }
  };
  const handleAvatarOption = (action) => {
    setShowAvatarMenu(false);
  
    switch (action) {
      case "upload":
        // open native file picker
        fileInputRef.current?.click();
        break;

      case "camera":
        // open capture modal
        setShowCapturePhoto(true);
        break;

      case "library":
        setShowAvatarLibrary(true);
        break;

      case "remove":
        setFormData({ ...formData, profile_image: "" });
        break;
    }
  };

  const photoPickerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData({ ...formData, profile_image: previewUrl });
  };


  const canContinue = step === 1 ? formData.name.trim().length > 0 : true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => {
            const active = s <= step

            return (
              <div
                key={s}
                className="flex items-center justify-center w-6"
              >
                <motion.div
                  initial={false}
                  animate={{
                    width: s === step ? 24 : 8,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    active ? "bg-foreground" : "bg-muted"
                  }`}
                />
              </div>
            )
          })}
        </div>


        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Set up your profile</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Tell us a bit about yourself
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium pb-2">Name *</label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium pb-2">About</label>
                    <Input
                      placeholder="A short bio (optional)"
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && !showAvatarLibrary && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Choose your photo</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Add a profile picture
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden hover:border-foreground transition-colors"
                    >
                      {formData.profile_image ? (
                        // If the profile image is a simple string (data URL, blob URL, or path)
                        // use a regular <img> to avoid requiring explicit width/height for next/image.
                        typeof formData.profile_image === "string" ? (
                          // plain img handles data URLs and object URLs
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={formData.profile_image}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={formData.profile_image}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <User className="text-muted-foreground w-12 h-12" />
                      )}
                    </motion.button>

                    {/* Avatar menu */}
                    <AnimatePresence>
                      {showAvatarMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-48 z-10"
                        >
                          {[
                            { icon: Camera, label: "Take photo", action: "camera" },
                            { icon: Upload, label: "Upload from file", action: "upload" },
                            { icon: ImageIcon, label: "Choose from library", action: "library" },
                            { icon: X, label: "Remove photo", action: "remove" },
                          ].map((item, index) => (
                            <motion.button
                              key={item.action}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleAvatarOption(item.action)}
                              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                            >
                              <item.icon size={18} className="text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Tap to change your profile photo
                </p>
              </motion.div>
            )}
            {step === 2 && showAvatarLibrary && (
              <motion.div
                key="avatar-library"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">Choose an Avatar</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Pick a cute character
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {cartoonAvatars.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFormData({ ...formData, profile_image: item.src });
                        setShowAvatarLibrary(false);
                      }}
                      className={`aspect-square rounded-2xl overflow-hidden border-2 ${
                        formData.profile_image === item.src
                          ? "border-foreground ring-2 ring-foreground/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image src={item.src} className="w-full h-full object-cover" alt="avatar" width={100} height={100} />
                    </motion.button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowAvatarLibrary(false)}
                  className="w-full"
                >
                  Go back
                </Button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Continue button */}
          {!showAvatarLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full"
              size="lg"
            >
              {step === 2 ? (
                <>
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={18} />
                </>
              )}
            </Button>
          </motion.div>
          
        )}

          {/* Back button */}
          {step === 2 && !showAvatarLibrary && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setStep(1)}
              className="w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Go back
            </motion.button>
          )}
        </div>
      </motion.div>
      {/* Hidden/overlay components for upload/capture/library (Avatar logic) */}
      {showCapturePhoto && (
        <CapturePhoto
          setImage={(value) => setFormData({ ...formData, profile_image: value })}
          onClose={() => setShowCapturePhoto(false)}
        />
      )}

      <PhotoPicker ref={fileInputRef} onChange={photoPickerChange} />
    </div>
  );
}

