"use client";

import { ReactNode, useState } from "react";
import { PackageProvider } from "../../lib/package-context";
import DashboardSidebar from "../../components/DashboardSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PackageProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ 
          flex: 1, 
          marginLeft: sidebarOpen ? '280px' : '80px',
          transition: 'margin-left 0.3s ease',
          background: '#f8fafc'
        }}>
          {children}
        </main>
      </div>
    </PackageProvider>
  );
} 