"use client";
import { forwardRef } from "react";

const PhotoPicker = forwardRef(function PhotoPicker({ onChange }, ref) {
  return (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      onChange={onChange}
      hidden
    />
  );
});

export default PhotoPicker;
