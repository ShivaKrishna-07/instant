import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

function CapturePhoto({ setImage, onClose,  }) {
  const videoRef = useRef(null);
  const DISPLAY_WIDTH = 480;
  const DISPLAY_HEIGHT = 360;
  useEffect(() => {
    let stream;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    // Use the displayed dimensions to avoid size changes when stream metadata loads
    canvas.width = DISPLAY_WIDTH;
    canvas.height = DISPLAY_HEIGHT;
    ctx.drawImage(video, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
    setImage(canvas.toDataURL("image/png"));
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-[640px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-end p-3">
          <IoClose
            className="h-8 w-8 cursor-pointer text-white"
            onClick={onClose}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-black rounded-lg w-[480px] h-[360px] flex items-center justify-center overflow-hidden">
            <video
              id="video"
              ref={videoRef}
              width={DISPLAY_WIDTH}
              height={DISPLAY_HEIGHT}
              className="object-cover w-full h-full"
              autoPlay
              playsInline
              muted
            ></video>
          </div>
        </div>

        <div className="flex justify-center items-center p-4">
          <button
            className="h-14 w-14 bg-white rounded-full cursor-pointer border-8 border-teal-400 p-2"
            onClick={capturePhoto}
            aria-label="Capture photo"
          />
        </div>
      </div>
    </div>
  );
}

export default CapturePhoto;
