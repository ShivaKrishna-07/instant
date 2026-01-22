"use client"
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, Volume2, VolumeX } from "lucide-react";
import { useStateProvider } from '@/context/StateContext';

export default function VoiceCallModal({
  isOpen,
  onClose,
  localStream,
  remoteStream,
  onAnswer,
  onDecline
}) {
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callTime, setCallTime] = useState(0);

  const [{ currentChatUser }] = useStateProvider();

  // start timer only when modal open and remote stream is present
  useEffect(() => {
    const connected = !!remoteStream && isOpen;
    let iv;
    if (isOpen && connected) {
      setCallTime(0);
      iv = window.setInterval(() => setCallTime((p) => p + 1), 1000);
    }
    return () => {
      if (iv) window.clearInterval(iv);
    };
  }, [remoteStream, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const remoteAudio = document.getElementById('vc-remote-audio');
    const localAudio = document.getElementById('vc-local-audio');
    if (remoteAudio && remoteStream) remoteAudio.srcObject = remoteStream;
    if (localAudio && localStream) localAudio.srcObject = localStream;
  }, [isOpen, localStream, remoteStream]);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((p) => !p);
  };

  if (!isOpen) return null;

  const displayContact = currentChatUser || { name: 'caller', avatar: '/favicon.ico' };

  const phase = remoteStream ? 'connected' : isOpen ? 'calling' : 'idle';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  const connected = !!remoteStream && isOpen;


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <div className="relative h-full w-full flex flex-col">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-white/[0.02] blur-3xl" />
              </div>
            </div>

            {/* Top bar (show only when connected) */}
            {(connected) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative z-10 p-4 sm:p-6 flex items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">
                    {formatTime(callTime)}
                  </span>
                </div>
              </motion.div>
            )}


            {/* Center profile */}
            <div className="flex-1 relative z-10 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="text-center space-y-6"
              >
                <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
                  {[0, 0.3, 0.6].map((d, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-white/10"
                      animate={{ scale: [1, 1.25 + i * 0.15, 1], opacity: [0.25, 0, 0.25] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: d }}
                    />
                  ))}

                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-4 sm:inset-5 md:inset-6 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl"
                  >
                    <img
                      src={displayContact.profile_image}
                      alt={displayContact.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                    {displayContact.name}
                  </h2>
                  <p className="text-white/50 text-sm">
                    {phase === 'calling'
                      ? 'Calling...'
                      : phase === 'incoming'
                        ? 'Incoming call'
                        : 'Voice call'}
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Bottom controls */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, delay: 0.3 }}
              className="relative z-10 p-6 sm:p-8 pb-8 sm:pb-12"
            >
              <div className="flex items-center justify-center gap-6">
                {phase === 'incoming' ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onDecline || onClose}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 
                                 text-white flex items-center justify-center"
                    >
                      <Phone size={28} strokeWidth={2.2} className="rotate-[135deg]" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onAnswer}
                      className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 
                                 text-white shadow-lg shadow-green-500/30"
                    >
                      Answer
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Mute */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMute}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full 
                        flex items-center justify-center transition-colors ${
                        muted
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {muted
                        ? <MicOff size={24} strokeWidth={2.2} />
                        : <Mic size={24} strokeWidth={2.2} />
                      }
                    </motion.button>

                    {/* End Call */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 
                                 text-white shadow-lg shadow-red-500/30 
                                 flex items-center justify-center"
                    >
                      <Phone size={28} strokeWidth={2.2} className="rotate-[135deg]" />
                    </motion.button>

                    {/* Speaker */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSpeakerOn((p) => !p)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full 
                        flex items-center justify-center transition-colors ${
                        speakerOn
                          ? 'bg-white/20 text-white hover:bg-white/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {speakerOn
                        ? <Volume2 size={24} strokeWidth={2.2} />
                        : <VolumeX size={24} strokeWidth={2.2} />
                      }
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>

            <audio id="vc-remote-audio" autoPlay />
            <audio id="vc-local-audio" autoPlay muted />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
