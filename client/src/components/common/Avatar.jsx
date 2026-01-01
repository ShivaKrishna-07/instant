"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuCordinates, setContextMenuCordinates] = useState({
    x: 0,
    y: 0,
  });
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [showCapturePhoto, setShowCapturePhoto] = useState(false);
  const fileInputRef = useRef(null);

  const contextMenuOptions = [
    {
      name: "Take Photo",
      callback: () => {
        setShowCapturePhoto(true);
      },
    },
    {
      name: "Choose from Library",
      callback: () => {
        setShowPhotoLibrary(true);
      },
    },
    {
      name: "Upload Photo",
      callback: () => {
        openPicker();
      },
    },
    {
      name: "Remove Photo",
      callback: () => {
        setImage("/default_avatar.png");
      },
    },
  ];

  const showContextMenu = (e) => {
    e.preventDefault();
    setIsContextMenuVisible(true);
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const photoPickerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {type === "sm" && (
          <div className="relative h-10 w-10">
            <Image src={image} alt="avatar" className="rounded-full" fill />
          </div>
        )}
        {type === "lg" && (
          <div className="relative h-14 w-14">
            <Image src={image} alt="avatar" className="rounded-full" fill />
          </div>
        )}
        {type === "xl" && (
          <div
            className="relative cursor-pointer z-0"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <div
              className={`z-10 absolute top-0 left-0 h-60 w-60 flex items-center justify-center flex-col text-center gap-2 rounded-full bg-photopicker-overlay-background ${
                hover ? "visible" : "hidden"
              }`}
              onClick={showContextMenu}
              id="context-opener"
            >
              <FaCamera
                className="text-2xl"
                onClick={showContextMenu}
                id="context-opener"
              />
              <span id="context-opener" onClick={showContextMenu}>
                Change Profile Picture
              </span>
            </div>
            <div className="h-60 w-60">
              <Image
                src={image}
                alt="avatar"
                className="rounded-full"
                fill
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
      <ContextMenu
        options={contextMenuOptions}
        cordinates={contextMenuCordinates}
        contextMenu={isContextMenuVisible}
        setContextMenu={setIsContextMenuVisible}
      />
      {showCapturePhoto && (
        <CapturePhoto
          setImage={setImage}
          onClose={() => setShowCapturePhoto(false)}
        />
      )}
      <PhotoPicker ref={fileInputRef} onChange={photoPickerChange} />
      {showPhotoLibrary && (
        <PhotoLibrary
          setImage={setImage}
          onClose={() => setShowPhotoLibrary(false)}
        />
      )}
    </>
  );
}

export default Avatar;
