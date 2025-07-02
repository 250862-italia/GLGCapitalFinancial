"use client";
import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number; // ms
}

const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 32,
      right: 32,
      background: "#111827",
      color: "#fff",
      padding: "1rem 2rem",
      borderRadius: 8,
      boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      zIndex: 9999,
      fontWeight: 600,
      fontSize: 16,
      minWidth: 220,
      textAlign: "center",
      opacity: 0.97,
      transition: "opacity 0.2s"
    }}>
      {message}
    </div>
  );
};

export default Toast; 