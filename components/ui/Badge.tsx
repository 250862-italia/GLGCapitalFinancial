// components/ui/Badge.tsx
import * as React from "react";

export function Badge(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded" {...props} />
  );
}
