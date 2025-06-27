"use client";

import { PackageProvider } from '../../lib/package-context';
import { AuthProvider } from '../../hooks/use-auth';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ReservedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <PackageProvider>
          {children}
        </PackageProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
} 