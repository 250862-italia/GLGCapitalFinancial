"use client";

import React from "react";

interface ModalProps {
  open?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open = true, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(10,37,64,0.35)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(10,37,64,0.18)",
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          minWidth: 320,
          maxWidth: 420,
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#0a2540",
            cursor: "pointer"
          }}
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
} 