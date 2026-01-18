import { useStateProvider } from "@/context/StateContext";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Send, Pause, Play, Square } from "lucide-react";
import { reducerCases } from "@/context/constants";
import apiClient from "@/utils/api";

function CaptureAudio({ hide }) {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isRecording, isPaused]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        try {
          const url = URL.createObjectURL(blob);
          // prepare audio element for playback
          if (!audioRef.current) audioRef.current = new Audio(url);
          else audioRef.current.src = url;
          audioRef.current.onended = () => setIsPlaying(false);
          audioRef.current.onplay = () => setIsPlaying(true);
          audioRef.current.onpause = () => setIsPlaying(false);
        } catch (e) {
          console.warn("Could not create playback audio:", e);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      hide();
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) mediaRecorderRef.current.resume();
    else mediaRecorderRef.current.pause();
    setIsPaused((p) => !p);
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const handleDelete = () => {
    handleStop();
    hide();
  };

  const handleSend = async () => {
    // if still recording, stop first
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      // give a moment for onstop to populate chunks
      setTimeout(() => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          sendBlob(blob);
        }
      }, 150);
    } else if (audioBlob) {
      sendBlob(audioBlob);
    }
  };

  const sendBlob = async (blob) => {
    const tempId = `temp-${Date.now()}`;
    const file = new File([blob], `recording-${Date.now()}.webm`);
    const localUrl = URL.createObjectURL(file);

    const tempMessage = {
      id: tempId,
      temp_id: tempId,
      message: localUrl,
      type: "audio",
      sender_id: userInfo.id,
      to: currentChatUser.id,
      created_at: new Date().toISOString(),
      message_status: "sending",
      duration,
    };

    dispatch({ type: reducerCases.ADD_MESSAGE, newMessage: tempMessage });

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("from", userInfo.id);
      formData.append("to", currentChatUser.id);

      const { data } = await apiClient.post("/messages/add-audio-message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.current.emit("send-msg", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message,
      });

      dispatch({ type: reducerCases.UPDATE_MESSAGE, temp_id: tempId, newMessage: { ...data.message } });
      hide();
    } catch (error) {
      console.error("Failed to send audio:", error);
      dispatch({ type: reducerCases.REMOVE_MESSAGE, temp_id: tempId });
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-2 w-full"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          onClick={handleDelete}
          className="w-9 h-9 flex items-center justify-center rounded-full text-red-600 hover:bg-red-600/10"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </motion.div>

      <div className="flex-1 flex items-center gap-3 bg-muted/50 rounded-full px-3 py-2 min-w-0">
        {/* Indicator: recording dot or playback control */}
        <AnimatePresence mode="wait">
          {isRecording ? (
            isPaused ? (
              <motion.div
                key="paused"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0"
              />
            ) : (
              <motion.div
                key="rec"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"
                style={{ animation: "pulse 1.5s ease-in-out infinite" }}
              />
            )
          ) : audioBlob ? (
            <motion.button
              key="playback"
              onClick={() => {
                if (!audioRef.current) return;
                if (!isPlaying) {
                  audioRef.current.play();
                  setIsPlaying(true);
                } else {
                  audioRef.current.pause();
                  setIsPlaying(false);
                }
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/40"
              aria-label="Play/Pause recording"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </motion.button>
          ) : (
            <motion.div key="empty" className="w-2.5 h-2.5" />
          )}
        </AnimatePresence>

        <div className="flex-1 flex items-center justify-center gap-[2px] h-6 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-foreground/60 rounded-full"
              initial={{ height: 4 }}
              animate={
                (isRecording && !isPaused) || isPlaying
                  ? { height: [4, Math.random() * 20 + 8, 4] }
                  : { height: 4 }
              }
              transition={{
                duration: 0.45,
                repeat: (isRecording && !isPaused) || isPlaying ? Infinity : 0,
                delay: i * 0.04,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <span className="text-xs font-medium tabular-nums shrink-0">{formatTime(duration)}</span>
      </div>

      {isRecording && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handlePauseResume}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-700/40"
            title="Pause/Resume"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </motion.div>
      )}

      {isRecording && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleStop}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-700/40"
            title="Stop"
          >
            <Square size={16} />
          </button>
        </motion.div>
      )}

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          onClick={handleSend}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:brightness-105"
          title="Send"
        >
          <Send size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default CaptureAudio;
