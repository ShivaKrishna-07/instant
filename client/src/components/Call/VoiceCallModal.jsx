"use client"
import React, { useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

export default function VoiceCallModal({ isOpen, onClose, localStream, remoteStream }) {
  const [muted, setMuted] = useState(false);

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
    localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMuted(prev => !prev);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <audio id="vc-remote-audio" autoPlay />
      <audio id="vc-local-audio" autoPlay muted />
      <div className="w-[360px] bg-[#0b0b0b] rounded-lg p-6 text-center text-white">
        <div className="text-xl font-semibold">Voice Call</div>
        <div className="text-secondary mt-2">Connected</div>

        <div className="mt-6 flex justify-center gap-4">
          <button onClick={toggleMute} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
            {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button onClick={() => { try { onClose(); } catch(e){} }} className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <MdCallEnd />
          </button>
        </div>
      </div>
    </div>
  );
}
