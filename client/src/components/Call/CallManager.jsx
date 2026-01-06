"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useStateProvider } from '@/context/StateContext';
import { reducerCases } from '@/context/constants';
import VideoCallModal from './VideoCallModal';
import VoiceCallModal from './VoiceCallModal';
import IncomingCallModal from './IncomingCallModal';

const defaultIceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function CallManager() {
  const [{ userInfo, socket, currentChatUser, outgoingCall, incomingCall }, dispatch] = useStateProvider();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callOpen, setCallOpen] = useState(false);
  const [callKind, setCallKind] = useState('video');

  useEffect(() => {
    if (incomingCall) setCallKind(incomingCall.kind || 'video');
  }, [incomingCall]);

  useEffect(() => {
    if (!socket || !socket.current) return;

    const s = socket.current;

    const handleIncoming = ({ from, offer, fromMeta }) => {
      const kind = (fromMeta && fromMeta.kind) || 'video';
      // push incoming call into global state so UI can respond
      dispatch({ type: reducerCases.SET_INCOMING_CALL, payload: { from, offer, fromMeta, kind } });
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

  // react to outgoing call requests from context
  useEffect(() => {
    if (!outgoingCall || !outgoingCall.targetId) return;
    const { targetId, kind } = outgoingCall;
    // start outgoing call
    callUser(targetId, kind).then(() => {
      // clear outgoing call request once handled
      try { dispatch({ type: reducerCases.CLEAR_OUTGOING_CALL }); } catch(e) {}
    }).catch(() => {
      try { dispatch({ type: reducerCases.CLEAR_OUTGOING_CALL }); } catch(e) {}
    });
  }, [outgoingCall]);

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
    try { dispatch({ type: reducerCases.CLEAR_INCOMING_CALL }); } catch(e) {}
    try { dispatch({ type: reducerCases.END_CALL }); } catch(e) {}
  };

  const startLocalStream = async (kind = 'video') => {
    try {
      const constraints = kind === 'voice' ? { audio: true, video: false } : { audio: true, video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

  const callUser = async (targetId, kind = 'video') => {
    try {
      setCallKind(kind);
      const stream = await startLocalStream(kind);
      const pc = createPeerConnection(targetId);
      pcRef.current = pc;
      // add tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.current.emit('call-user', { to: targetId, from: userInfo.id, offer, fromMeta: { name: userInfo.name, kind } });
      setCallOpen(true);
    } catch (e) {
      console.error('callUser error', e);
    }
  };

  const acceptIncoming = async () => {
    const call = incomingCall;
    if (!call) return;
    try {
      const stream = await startLocalStream(call.kind || 'video');
      const pc = createPeerConnection(call.from);
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current.emit('accept-call', { to: call.from, from: userInfo.id, answer });
      setCallOpen(true);
      dispatch({ type: reducerCases.CLEAR_INCOMING_CALL });
    } catch (e) {
      console.error('acceptIncoming error', e);
    }
  };

  const rejectIncoming = () => {
    const call = incomingCall;
    if (!call) return;
    socket.current.emit('reject-call', { to: call.from, from: userInfo.id });
    dispatch({ type: reducerCases.CLEAR_INCOMING_CALL });
  };

  const endCall = () => {
    if (!pcRef.current) {
      cleanupCall();
      return;
    }
    // notify peer
    const partnerId = currentChatUser?.id || (incomingCall && incomingCall.from);
    if (partnerId) socket.current.emit('end-call', { to: partnerId, from: userInfo.id });
    cleanupCall();
  };

  return (
    <>
      <IncomingCallModal isOpen={!!incomingCall} callerName={incomingCall?.fromMeta?.name} kind={incomingCall?.kind} onAccept={acceptIncoming} onReject={rejectIncoming} />
      {callKind === 'voice' ? (
        <VoiceCallModal isOpen={callOpen} onClose={endCall} localStream={localStreamRef.current} remoteStream={remoteStream} />
      ) : (
        <VideoCallModal isOpen={callOpen} onClose={endCall} pcRef={pcRef} localStream={localStreamRef.current} remoteStream={remoteStream} />
      )}
    </>
  );
}
