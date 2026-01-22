"use client"
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { useStateProvider } from '@/context/StateContext';

export default function VideoCallModal({ isOpen, onClose, pcRef, localStream, remoteStream, onAnswer, onDecline }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callTime, setCallTime] = useState(0);

  const [{ currentChatUser }] = useStateProvider();

  // Start timer only when modal open and remote stream present
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
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [isOpen, localStream, remoteStream]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const displayContact = currentChatUser || { name: 'caller', profile_image: '/favicon.ico' };

  // derive phase: 'calling' (outgoing), 'incoming' (callee view), 'connected'
  const phase = remoteStream ? 'connected' : isOpen ? 'calling' : 'idle';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20 }} className="text-center space-y-6">
                  <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
                    {[0, 0.3, 0.6].map((d, i) => (
                      <motion.div key={i} className="absolute inset-0 rounded-full border border-white/10" animate={{ scale: [1, 1.15 + i * 0.1, 1], opacity: [0.4 - i*0.1, 0, 0.4 - i*0.1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: d }} />
                    ))}

                    <div className="absolute inset-4 sm:inset-5 md:inset-6 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
                      <img src={displayContact.profile_image} alt={displayContact.name} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white">{displayContact.name}</h2>
                    <p className="text-white/50 text-sm mt-1">{phase === 'calling' ? 'Calling...' : phase === 'incoming' ? 'Incoming call' : 'Connected'}</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Remote video (fills) */}
            <div className="absolute inset-0">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>

            {/* Top bar (only when connected) */}
            {(!!remoteStream && isOpen) && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-white/80 text-sm font-medium">{formatTime(callTime)}</span>
                </div>
              </motion.div>
            )}

            {/* Self preview */}
            {videoEnabled && (
              <div className="absolute top-20 right-4 sm:top-24 sm:right-6 w-24 h-32 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shadow-2xl">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
            )}

            {/* Bottom controls */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 25, delay: 0.3 }} className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pb-8 sm:pb-12">
              <div className="flex items-center justify-center gap-6">
                {phase === 'incoming' ? (
                  <>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDecline || onClose} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">
                      <MdCallEnd size={22} />
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onAnswer} className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30">
                      Answer
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                      if (!localStream) return;
                      localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
                      setMuted((p) => !p);
                    }} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      {muted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => {
                      if (!localStream) return;
                      localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
                      setVideoEnabled((p) => !p);
                    }} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors ${!videoEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      {videoEnabled ? <FaVideo size={22} /> : <FaVideoSlash size={22} />}
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { try { onClose(); } catch (e) {} }} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 flex items-center justify-center">
                      <MdCallEnd size={26} className="rotate-[135deg]" />
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
