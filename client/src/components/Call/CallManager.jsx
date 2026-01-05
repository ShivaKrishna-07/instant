"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useStateProvider } from '@/context/StateContext';
import VideoCallModal from './VideoCallModal';
import IncomingCallModal from './IncomingCallModal';

const defaultIceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function CallManager() {
  const [{ userInfo, socket, currentChatUser }, dispatch] = useStateProvider();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [incoming, setIncoming] = useState(null); // { from, fromMeta, offer }

  useEffect(() => {
    if (!socket || !socket.current) return;

    const s = socket.current;

    const handleIncoming = ({ from, offer, fromMeta }) => {
      setIncoming({ from, offer, fromMeta });
    };

    const handleCallAccepted = async ({ from, answer }) => {
      if (pcRef.current && answer) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIce = async ({ from, candidate }) => {
      if (candidate && pcRef.current) {
        try { await pcRef.current.addIceCandidate(candidate); } catch(e) {}
      }
    };

    const handleCallRejected = ({ from }) => {
      cleanupCall();
      alert('Call rejected');
    };

    const handleCallEnded = ({ from }) => {
      cleanupCall();
    };

    s.on('incoming-call', handleIncoming);
    s.on('call-accepted', handleCallAccepted);
    s.on('ice-candidate', handleIce);
    s.on('call-rejected', handleCallRejected);
    s.on('call-ended', handleCallEnded);

    return () => {
      s.off('incoming-call', handleIncoming);
      s.off('call-accepted', handleCallAccepted);
      s.off('ice-candidate', handleIce);
      s.off('call-rejected', handleCallRejected);
      s.off('call-ended', handleCallEnded);
    };
  }, [socket]);

  // listen for UI-triggered start call events
  useEffect(() => {
    const handler = (e) => {
      const targetId = e?.detail?.targetId;
      if (targetId) callUser(targetId);
    };
    window.addEventListener('start-call', handler);
    return () => window.removeEventListener('start-call', handler);
  }, [socket, userInfo]);

  const cleanupCall = () => {
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    } catch (e) {}
    setRemoteStream(null);
    setCallOpen(false);
    setIncoming(null);
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      return stream;
    } catch (e) {
      console.error('getUserMedia failed', e);
      throw e;
    }
  };

  const createPeerConnection = (peerId) => {
    const pc = new RTCPeerConnection(defaultIceServers);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit('ice-candidate', { to: peerId, from: userInfo.id, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };
    return pc;
  };

  const callUser = async (targetId) => {
    try {
      const stream = await startLocalStream();
      const pc = createPeerConnection(targetId);
      pcRef.current = pc;
      // add tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.current.emit('call-user', { to: targetId, from: userInfo.id, offer, fromMeta: { name: userInfo.name } });
      setCallOpen(true);
    } catch (e) {
      console.error('callUser error', e);
    }
  };

  const acceptIncoming = async () => {
    if (!incoming) return;
    try {
      const stream = await startLocalStream();
      const pc = createPeerConnection(incoming.from);
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incoming.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current.emit('accept-call', { to: incoming.from, from: userInfo.id, answer });
      setCallOpen(true);
      setIncoming(null);
    } catch (e) {
      console.error('acceptIncoming error', e);
    }
  };

  const rejectIncoming = () => {
    if (!incoming) return;
    socket.current.emit('reject-call', { to: incoming.from, from: userInfo.id });
    setIncoming(null);
  };

  const endCall = () => {
    if (!pcRef.current) {
      cleanupCall();
      return;
    }
    // notify peer
    const partnerId = currentChatUser?.id || (incoming && incoming.from);
    if (partnerId) socket.current.emit('end-call', { to: partnerId, from: userInfo.id });
    cleanupCall();
  };

  return (
    <>
      <IncomingCallModal isOpen={!!incoming} callerName={incoming?.fromMeta?.name} onAccept={acceptIncoming} onReject={rejectIncoming} />
      <VideoCallModal isOpen={callOpen} onClose={endCall} pcRef={pcRef} localStream={localStreamRef.current} remoteStream={remoteStream} />
    </>
  );
}
