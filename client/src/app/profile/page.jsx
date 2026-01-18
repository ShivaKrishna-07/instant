"use client"
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Upload, Image, X, User, Edit3, Check } from "lucide-react";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

export default function ProfilePage() {
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();

  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileRef = useRef(null);

  const [edited, setEdited] = useState({
    name: userInfo?.name || "",
    about: userInfo?.about || "",
    email: userInfo?.email || "",
    phone: userInfo?.phone || "",
    location: userInfo?.location || "",
    avatar: userInfo?.profile_image || null,
  });

  const handleAvatarOption = (opt) => {
    setShowAvatarMenu(false);
    if (opt === "upload") fileRef.current?.click();
    else if (opt === "remove") setEdited((s) => ({ ...s, avatar: null }));
  };

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setEdited((s) => ({ ...s, avatar: reader.result }));
    reader.readAsDataURL(f);
  };

  const startEdit = () => {
    setEdited({
      name: userInfo?.name || "",
      about: userInfo?.about || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      location: userInfo?.location || "",
      avatar: userInfo?.profile_image || null,
    });
    setIsEditing(true);
  };

  const save = () => {
    dispatch({ type: reducerCases.SET_USER_INFO, userInfo: { ...userInfo, ...edited, profile_image: edited.avatar } });
    setIsEditing(false);
  };

  const cancel = () => {
    setEdited({
      name: userInfo?.name || "",
      about: userInfo?.about || "",
      email: userInfo?.email || "",
      phone: userInfo?.phone || "",
      location: userInfo?.location || "",
      avatar: userInfo?.profile_image || null,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/chat')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button onClick={startEdit} className="px-3 py-1 rounded-md border border-border hover:bg-muted flex items-center gap-2">
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={cancel} className="px-3 py-1 rounded-md border border-border hover:bg-muted">Cancel</button>
                <button onClick={save} className="px-3 py-1 rounded-md bg-primary text-primary-foreground"> <Check size={16} /> Save</button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="h-28 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--color-primary)/0.06),transparent)]" />
          </div>

          <div className="px-6 pb-6 -mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative">
                <button
                  onClick={() => isEditing && setShowAvatarMenu((s) => !s)}
                  disabled={!isEditing}
                  className={`w-28 h-28 rounded-2xl bg-muted border-4 border-card flex items-center justify-center overflow-hidden shadow-lg ${isEditing ? 'cursor-pointer hover:ring-2 ring-primary/50' : ''}`}
                >
                  {edited.avatar ? (
                    <img src={edited.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {showAvatarMenu && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-48 z-50">
                      <button onClick={() => handleAvatarOption('upload')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left"><Upload size={16} /> Upload</button>
                      <button onClick={() => handleAvatarOption('remove')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left"><X size={16} /> Remove</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 space-y-1">
                {!isEditing ? (
                  <h2 className="text-xl font-bold">{userInfo?.name || 'Unnamed'}</h2>
                ) : (
                  <input value={edited.name} onChange={(e) => setEdited((s) => ({ ...s, name: e.target.value }))} className="text-xl font-bold h-auto py-1 bg-transparent w-full" />
                )}
                <p className="text-sm text-muted-foreground flex items-center gap-1"> <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Online</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">About</h3>
            {!isEditing ? (
              <p className="text-foreground leading-relaxed">{userInfo?.about || 'No bio yet'}</p>
            ) : (
              <textarea value={edited.about} onChange={(e) => setEdited((s) => ({ ...s, about: e.target.value }))} className="w-full min-h-[100px] bg-transparent p-2 border border-border rounded" />
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Details</h3>
            <div className="space-y-4">
              <Row label="Email" value={isEditing ? edited.email : userInfo?.email} editing={isEditing} onChange={(v) => setEdited((s) => ({ ...s, email: v }))} />
              <Row label="Phone" value={isEditing ? edited.phone : userInfo?.phone} editing={isEditing} onChange={(v) => setEdited((s) => ({ ...s, phone: v }))} />
              <Row label="Location" value={isEditing ? edited.location : userInfo?.location} editing={isEditing} onChange={(v) => setEdited((s) => ({ ...s, location: v }))} />
            </div>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}

function Row({ label, value, editing, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        <span className="text-muted-foreground text-sm">{label.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editing ? (
          <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm mt-1 w-full bg-transparent border border-border rounded p-2" />
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
