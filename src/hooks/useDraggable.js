// src/hooks/useDraggable.js
import { useRef, useEffect, useState } from "react";

export const useDraggable = (
  defaultPosition = { top: "10px", left: "10px" },
  containerId = "map" // restrict dragging inside map container
) => {
  const ref = useRef(null);
  const [resetKey, setResetKey] = useState(0);

  const applyDefaultPosition = () => {
    if (!ref.current) return;
    ref.current.style.position = "absolute";
    Object.entries(defaultPosition).forEach(([k, v]) => {
      ref.current.style[k] = v;
    });
    ref.current.style.right = "auto";
    ref.current.style.bottom = "auto";
  };

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container with id "${containerId}" not found`);
      return;
    }

    applyDefaultPosition();

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const handleMouseDown = (e) => {
      if (e.target.closest(".reset-btn")) return; // skip drag if clicking reset button
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      let newLeft = e.clientX - offsetX - containerRect.left;
      let newTop = e.clientY - offsetY - containerRect.top;

      // Restrict within container
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - elementRect.width));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - elementRect.height));

      element.style.left = `${newLeft}px`;
      element.style.top = `${newTop}px`;
      element.style.right = "auto";
      element.style.bottom = "auto";
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const header = element.querySelector(".drag-header");
    if (header) {
      header.style.cursor = "move";
      header.addEventListener("mousedown", handleMouseDown);
    }

    // Reset on resize
    const handleResize = () => applyDefaultPosition();
    window.addEventListener("resize", handleResize);

    return () => {
      if (header) header.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [resetKey, defaultPosition, containerId]);

  const resetPosition = () => {
    setResetKey((k) => k + 1);
    applyDefaultPosition();
  };

  return [ref, resetPosition];
};
