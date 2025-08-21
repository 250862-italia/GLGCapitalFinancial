'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/use-admin-auth';
import Link from 'next/link';
import GLGLogo from '@/components/GLGLogo';
import {
  RiDashboardLine, RiUserLine, RiBankCardLine, RiLineChartLine, 
  RiBarChartLine, RiSettings3Line, RiLogoutBoxRLine, RiMenuLine, RiCloseLine,
  RiFileTextLine
} from 'react-icons/ri';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Controlla se siamo nella pagina di login
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Solo reindirizza se non stiamo caricando, non siamo autenticati e non siamo nella pagina di login
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated, router, isLoginPage]);

  // Se siamo nella pagina di login, renderizza solo i children
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: RiDashboardLine },
    { name: 'Clienti', href: '/admin/clients', icon: RiUserLine },
    { name: 'Pacchetti', href: '/admin/packages', icon: RiBankCardLine },
    { name: 'Investimenti', href: '/admin/investments', icon: RiLineChartLine },
    { name: 'Documenti', href: '/admin/documents', icon: RiFileTextLine },
    { name: 'Analytics', href: '/admin/analytics', icon: RiBarChartLine },
    { name: 'Impostazioni', href: '/admin/settings', icon: RiSettings3Line },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar per desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          {/* Logo e header sidebar */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <GLGLogo size="sm" showText={false} />
              <div className="text-white">
                <h1 className="text-lg font-bold">GLG Capital</h1>
                <p className="text-xs text-blue-100">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Menu di navigazione */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout button */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <RiLogoutBoxRLine className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <RiCloseLine className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Logo e header sidebar mobile */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <GLGLogo size="sm" showText={false} />
              <div className="text-white">
                <h1 className="text-lg font-bold">GLG Capital</h1>
                <p className="text-xs text-blue-100">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Menu di navigazione mobile */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout button mobile */}
            <div className="flex-shrink-0 border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <RiLogoutBoxRLine className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header mobile */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <RiMenuLine className="h-6 w-6" />
          </button>
        </div>

        {/* Contenuto della pagina */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 