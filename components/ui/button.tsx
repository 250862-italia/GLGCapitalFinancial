// components/ui/Button.tsx
"use client";

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  className?: string;
}

export function Button({
  children,
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded font-medium transition";
  const styles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
