// components/ui/Card.tsx
import * as React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="border rounded-lg shadow p-4 bg-white" {...props} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-2 text-sm text-gray-700" {...props} />;
}
