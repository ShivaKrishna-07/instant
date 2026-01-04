import { calculateTime } from "@/utils/CalculateTime";
import React, { useEffect, useRef, useState } from "react";
import MessageStatus from "../common/MessageStatus";
import { FaPause, FaPlay, FaMicrophone } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";
import WaveSurfer from "wavesurfer.js";

function VoiceMessage({ message, userInfo, currentChatUser }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const waveformRef = useRef(null);
  const waveform = useRef(null);

  useEffect(() => {
    if (waveformRef.current && message.message) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 30,
        responsive: true,
      });

      waveform.current = wavesurfer;

      wavesurfer.load(message.message);

      wavesurfer.on("ready", () => {
        setTotalDuration(wavesurfer.getDuration());
      });

      wavesurfer.on("audioprocess", () => {
        setCurrentPlaybackTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on("finish", () => {
        setIsPlaying(false);
      });

      return () => {
        if (wavesurfer && !wavesurfer.isDestroyed) {
          wavesurfer.stop();
          wavesurfer.destroy();
        }
      };
    }
  }, [message.message]);

  const handlePlayAudio = () => {
    if (waveform.current) {
      waveform.current.play();
      setIsPlaying(true);
    }
  };

  const handlePauseAudio = () => {
    if (waveform.current) {
      waveform.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 text-white rounded-md ${
        message.sender_id === currentChatUser.id
          ? "bg-incoming-background"
          : "bg-outgoing-background"
      } max-w-[70%]`}
    >
      {/* Avatar with mic overlay */}
      <div className="relative flex-shrink-0">
        <img
          src={
            message.sender_id === currentChatUser.id
              ? currentChatUser?.profile_image || "/default_avatar.png"
              : userInfo?.profile_image || "/default_avatar.png"
          }
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 bg-accent p-1 rounded-full">
          <FaMicrophone className="text-white text-xs" />
        </div>
      </div>

      {/* Play / Pause / Loader */}
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? handlePauseAudio : handlePlayAudio}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          {message.message_status === "sending" ? (
            <FaSpinner className="animate-spin text-white/80" />
          ) : isPlaying ? (
            <FaPause className="text-white" />
          ) : (
            <FaPlay className="text-white" />
          )}
        </button>

        <div className="w-40">
          <div ref={waveformRef} className="w-full" />
        </div>
      </div>

      <div className="flex flex-col items-end ml-auto gap-1">
        <span className="text-bubble-meta text-[11px] text-white/60">
          {formatTime(isPlaying ? currentPlaybackTime : totalDuration)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-bubble-meta text-[11px] text-white/60">
            {calculateTime?.(message.created_at) || ""}
          </span>
          {message.sender_id === userInfo.id && (
            <MessageStatus status={message.message_status} />
          )}
        </div>
      </div>
    </div>
  );
}

export default VoiceMessage;
