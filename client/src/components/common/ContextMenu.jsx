"use client";
import React, { useEffect, useRef, useState } from "react";

function ContextMenu({ options, cordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(()=>{
    const handleClickOutside = (event) => {
      if(event.target.id !== "context-opener") {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setContextMenu(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setContextMenu]);

  useEffect(() => {
    if (!contextMenu || !contextMenuRef.current) return;

    const menu = contextMenuRef.current;
    const menuRect = menu.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = cordinates.y;
    let left = cordinates.x;

    // 🔼 Flip vertically if overflowing bottom
    if (cordinates.y + menuRect.height > viewportHeight) {
      top = cordinates.y - menuRect.height;
    }

    // ◀ Shift left if overflowing right
    if (cordinates.x + menuRect.width > viewportWidth) {
      left = cordinates.x - menuRect.width;
    }

    // Prevent negative values
    top = Math.max(8, top);
    left = Math.max(8, left);

    setPosition({ top, left });
  }, [contextMenu, cordinates]);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    callback();
    setContextMenu(false);
  }

  if(!contextMenu) return null;
  
  return (
    <div
      className={`bg-dropdown-background fixed py-2 z-100 rounded-md shadow-lg ${
        contextMenu ? "block" : "hidden"
      }`}
      style={{
        top: position.top,
        left: position.left,
      }}
      ref={contextMenuRef}
    >
      <ul>
        {options.map((option) => (
          <li
            key={option.name}
            onClick={(e) => handleClick(e, option.callback)}
            className="px-5 py-2 hover:bg-dropdown-background-hover cursor-pointer"
          >
            <span className="text-white">{option.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContextMenu;
