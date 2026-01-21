"use client"
import React, { useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function VoiceCallModal({ isOpen, onClose, localStream, remoteStream, contact, callState, onAnswer, onDecline }) {
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callTime, setCallTime] = useState(0);

  // start timer only when connected
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
    // attach audio streams to hidden audio elements
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

  const phase = callState ? callState : remoteStream ? 'connected' : isOpen ? 'calling' : 'idle';

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-white/[0.02] blur-3xl" />
          </div>
        </div>

        {/* Top bar */}
        <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
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

        {/* Center profile section */}
        <div className="flex-1 relative z-10 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52">
              <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-white/10" style={{ transform: 'scale(1.15)' }} />
              <div className="absolute inset-4 sm:inset-5 md:inset-6 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
                <img src={contact?.avatar || '/favicon.ico'} alt={contact?.name || 'caller'} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">{contact?.name || 'Voice call'}</h2>
              <p className="text-white/50 text-sm">{phase === 'calling' ? 'Calling...' : phase === 'incoming' ? 'Incoming call' : 'Connected'}</p>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 p-6 sm:p-8 pb-8 sm:pb-12">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {phase === 'incoming' ? (
              <>
                <button onClick={onDecline || onClose} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white">
                  <MdCallEnd size={22} />
                </button>
                <button onClick={onAnswer} className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30">
                  Answer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${
                    muted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {muted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
                </button>

                <button
                  onClick={() => setSpeakerOn((p) => !p)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-colors ${
                    speakerOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {speakerOn ? <FaVolumeUp size={22} /> : <FaVolumeMute size={22} />}
                </button>

                <button onClick={() => { try { onClose(); } catch (e) {} }} className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30">
                  <MdCallEnd size={26} className="rotate-[135deg]" />
                </button>
              </>
            )}
          </div>
        </div>

        <audio id="vc-remote-audio" autoPlay />
        <audio id="vc-local-audio" autoPlay muted />
      </div>
    </div>
  );
}
