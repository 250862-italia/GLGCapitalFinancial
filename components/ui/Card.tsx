// components/ui/Card.tsx
import * as React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="border rounded-lg shadow p-4 bg-white" {...props} />;
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mb-4" {...props} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className="text-lg font-semibold text-gray-900" {...props} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mt-2 text-sm text-gray-700" {...props} />;
}
