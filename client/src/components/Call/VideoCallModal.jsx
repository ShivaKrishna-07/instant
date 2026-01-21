"use client"
import React, { useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';

export default function VideoCallModal({ isOpen, onClose, pcRef, localStream, remoteStream, contact, callState, onAnswer, onDecline }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callTime, setCallTime] = useState(0);

  // Start timer only when call becomes connected (either explicit callState or remoteStream available)
  useEffect(() => {
    const connected = callState === 'connected' || (!!remoteStream && isOpen);
    let iv;
    if (connected) {
      setCallTime(0);
      iv = setInterval(() => setCallTime((p) => p + 1), 1000);
    }
    return () => clearInterval(iv);
  }, [callState, remoteStream, isOpen]);

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

  // derive phase: 'calling' (outgoing), 'incoming' (callee view), 'connected'
  const phase = callState
    ? callState
    : remoteStream
    ? 'connected'
    : isOpen
    ? 'calling'
    : 'idle';

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        {/* Background gradient + subtle grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Center avatar / status (fallback when remote video not available) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative text-center space-y-6">
                <div className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36">
                  <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-white/5" style={{ transform: 'scale(1.2)' }} />
                  <div className="absolute inset-2 sm:inset-3 rounded-full overflow-hidden border-2 border-white/10">
                    <img src={contact?.avatar || '/favicon.ico'} alt={contact?.name || 'caller'} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">{contact?.name || 'Video call'}</h2>
                  <p className="text-white/50 text-sm mt-1">
                    {phase === 'calling' && 'Calling...'}
                    {phase === 'incoming' && 'Incoming call'}
                    {phase === 'connected' && 'Connected'}
                  </p>
                </div>
              </div>
          </div>
        </div>

        {/* Remote video (fills) */}
        <div className="absolute inset-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white/80 text-sm font-medium">{formatTime(callTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white">•••</button>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white">
              <MdCallEnd />
            </button>
          </div>
        </div>

        {/* Self preview */}
        {videoEnabled && (
          <div className="absolute top-20 right-4 sm:top-24 sm:right-6 w-24 h-32 sm:w-32 sm:h-44 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shadow-2xl">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
        )}

        {/* Bottom controls - change based on phase */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pb-8 sm:pb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {phase === 'incoming' ? (
              // incoming: show accept / decline
              <>
                <button onClick={onDecline || onClose} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white">
                  <MdCallEnd size={22} />
                </button>
                <button onClick={onAnswer} className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30">
                  Answer
                </button>
              </>
            ) : (
              // calling or connected: show controls and end
              <>
                <button
                  onClick={() => {
                    if (!localStream) return;
                    localStream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
                    setMuted((p) => !p);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${
                    muted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {muted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
                </button>

                <button
                  onClick={() => {
                    if (!localStream) return;
                    localStream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
                    setVideoEnabled((p) => !p);
                  }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${
                    !videoEnabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {videoEnabled ? <FaVideo size={22} /> : <FaVideoSlash size={22} />}
                </button>

                <button onClick={() => { try { onClose(); } catch (e) {} }} className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30">
                  <MdCallEnd size={26} className="rotate-[135deg]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
