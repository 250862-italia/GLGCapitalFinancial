"use client";

import { ReactNode } from "react";
import { PackageProvider } from "../../lib/package-context";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <PackageProvider>{children}</PackageProvider>
    </ProtectedRoute>
  );
} 