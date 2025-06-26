// components/ui/Button.tsx
"use client";

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ children, variant = "default", className = "", ...props }: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded text-white font-medium transition";
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700",
    outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
