import Image from "next/image";
import React from "react";
import { IoClose } from "react-icons/io5";

function PhotoLibrary({ setImage, onClose }) {
  const images = [
    "/avatars/1.png",
    "/avatars/2.png",
    "/avatars/3.png",
    "/avatars/4.png",
    "/avatars/5.png",
    "/avatars/6.png",
    "/avatars/7.png",
    "/avatars/8.png",
    "/avatars/9.png",
  ];

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="max-h-[90vh] w-max bg-gray-900 gap-6 rounded-lg p-4 overflow-auto">
        <div>
          <IoClose className="h-10 w-10 cursor-pointer float-right" onClick={onClose} />
        </div>
        <div className="grid grid-cols-3 justify-center items-center gap-x-12 gap-y-8 p-6 w-full">
          {images.map((image, index) => (
            <div
              key={index}
              className="h-32 w-32 cursor-pointer"
              onClick={() => {
                setImage(image);
                onClose();
              }}
            >
              <div className="size-24 relative">
                <Image src={image} alt={`avatar-${index}`} className="rounded-full" fill />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PhotoLibrary;
