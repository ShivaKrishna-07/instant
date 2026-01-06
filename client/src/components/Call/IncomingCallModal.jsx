"use client"
import React from 'react';

export default function IncomingCallModal({ isOpen, callerName, kind = 'video', onAccept, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="w-[420px] bg-[#0b0b0b] rounded-lg p-6 text-center">
        <div className="text-white text-lg font-semibold">Incoming {kind === 'voice' ? 'voice' : 'video'} call</div>
        <div className="text-secondary mt-2">{callerName || 'Unknown'}</div>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={onReject} className="bg-white/10 text-white px-4 py-2 rounded">Reject</button>
          <button onClick={onAccept} className="bg-green-600 text-white px-4 py-2 rounded">Accept</button>
        </div>
      </div>
    </div>
  );
}
