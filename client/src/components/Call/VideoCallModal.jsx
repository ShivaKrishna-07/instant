"use client"
import React, { useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

export default function VideoCallModal({ isOpen, onClose, pcRef, localStream, remoteStream }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [isOpen, localStream, remoteStream]);

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMuted(!muted);
  };

  const toggleVideo = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setVideoEnabled(!videoEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="w-[900px] max-w-full h-[600px] bg-[#121212] rounded-lg p-4 flex flex-col">
        <div className="flex-1 flex gap-4">
          <div className="flex-1 bg-black rounded overflow-hidden flex items-center justify-center">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
          <div className="w-64 bg-black rounded overflow-hidden flex items-center justify-center">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={toggleMute} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">
            {muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button onClick={toggleVideo} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center">Video</button>
          <button onClick={() => {
            // end call
            try { onClose(); } catch(e){}
          }} className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <MdCallEnd />
          </button>
        </div>
      </div>
    </div>
  );
}
