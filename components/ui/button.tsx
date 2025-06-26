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
  const base = "px-4 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-accent";
  const styles = {
    default: "bg-[var(--primary)] text-[var(--secondary)] hover:bg-[var(--accent)] hover:text-[var(--primary)]",
    outline:
      "bg-transparent border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] hover:border-[var(--accent)]",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}