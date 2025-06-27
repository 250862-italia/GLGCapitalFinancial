"use client";

import { PackageProvider } from '../lib/package-context';

export default function PackageProviderWrapper({ children }: { children: React.ReactNode }) {
  return <PackageProvider>{children}</PackageProvider>;
} 