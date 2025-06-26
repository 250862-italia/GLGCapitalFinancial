// components/ui/button.tsx
"use client";

import * as React from "react";

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" {...props}>
      {children}
    </button>
  );
}
