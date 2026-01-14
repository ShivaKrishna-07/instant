import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera as CameraIcon, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

function CapturePhoto({ setImage, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("user");

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          // play() can reject with AbortError if the stream is removed quickly;
          // swallow AbortError to avoid noisy console errors
          await videoRef.current.play();
        } catch (playErr) {
          const name = playErr?.name || playErr?.message || "";
          if (name && name.includes("AbortError")) {
            // ignore aborts caused by rapid stop/start or removal
          } else {
            console.error("Error while playing video:", playErr);
            setError("Unable to play camera stream.");
            toast({
              title: "Camera error",
              description: "Unable to start camera playback.",
              variant: "destructive",
            });
          }
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      const name = err?.name || err?.message || "";
      if (name.includes("NotAllowedError") || name.includes("PermissionDenied")) {
        toast({
          title: "Camera access blocked",
          description: "Please allow camera access in your browser settings to take a photo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unable to access camera",
          description: "An unexpected error occurred while accessing your camera.",
          variant: "destructive",
        });
      }
      setError("Unable to access camera. Please check permissions.");
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      setCapturedImage(null);
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      setImage(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    if (!capturedImage) startCamera();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 sm:p-6"
        >
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/10">
            <X size={24} />
          </Button>
          <span className="text-white font-medium">Take Photo</span>
          <Button variant="ghost" size="icon" onClick={toggleCamera} className="text-white hover:bg-white/10">
            <RotateCcw size={20} />
          </Button>
        </motion.div>

        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {error ? (
            <div className="text-center p-8">
              <p className="text-white/70 mb-4">{error}</p>
              <Button variant="outline" onClick={startCamera}>
                Try Again
              </Button>
            </div>
          ) : capturedImage ? (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={capturedImage}
              alt="Captured"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
                  />
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`max-h-full max-w-full object-contain ${facingMode === "user" ? "scale-x-[-1]" : ""} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              />
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 sm:p-8 flex items-center justify-center gap-6"
        >
          {capturedImage ? (
            <>
              <Button variant="outline" size="lg" onClick={handleRetake} className="border-white/20 text-white hover:bg-white/10 gap-2">
                <RotateCcw size={18} />
                Retake
              </Button>
              <Button size="lg" onClick={handleConfirm} className="bg-white text-black hover:bg-white/90 gap-2">
                <Check size={18} />
                Use Photo
              </Button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
              disabled={isLoading || !!error}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-black/20 flex items-center justify-center">
                <CameraIcon size={24} className="text-black" />
              </div>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CapturePhoto;
