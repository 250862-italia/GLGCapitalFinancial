"use client";

import { ReactNode } from "react";
import { PackageProvider } from "../../lib/package-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PackageProvider>{children}</PackageProvider>;
} 