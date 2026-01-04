import React, { useEffect, useRef, useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdClose } from "react-icons/md";

function SearchBar({ visible, onClose, onSearchChange, count, index, onNext, onPrev, value }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible]);

  return (
    <div
      className={`absolute left-4 right-4 top-[68px] transition-transform duration-150 ${
        visible
          ? "translate-y-0 pointer-events-auto opacity-100"
          : "-translate-y-4 pointer-events-none opacity-0"
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-panel-header-background rounded-md px-3 py-2 flex items-center gap-2 shadow-lg">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (e.shiftKey) onPrev();
              else onNext();
            }
          }}
          placeholder="Search messages..."
          className="flex-1 bg-transparent outline-none text-white px-2 py-1"
        />
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="p-1 hover:bg-white/5 rounded cursor-pointer" title="Previous result">
            <MdKeyboardArrowUp className="text-white text-xl" />
          </button>
          <button onClick={onNext} className="p-1 hover:bg-white/5 rounded cursor-pointer" title="Next result">
            <MdKeyboardArrowDown className="text-white text-xl" />
          </button>
        </div>
        <div className="text-white/70 text-sm px-2">{count > 0 ? `${index + 1} of ${count}` : "0 of 0"}</div>
        <button onClick={onClose} className="ml-1 p-1 hover:bg-white/5 rounded cursor-pointer" title="Close search">
          <MdClose className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
