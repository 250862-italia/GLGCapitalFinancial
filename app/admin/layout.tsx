import type { Metadata } from 'next';
import '../globals.css';
import RealTimeNotifications from '@/components/RealTimeNotifications';

export const metadata: Metadata = {
  title: 'Admin Dashboard - GLG Capital Financial',
  description: 'Pannello di amministrazione per la gestione di clienti e investimenti',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                GLG Capital Financial - Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Notifiche Real-Time */}
      <RealTimeNotifications token="admin_test_token_123" />
    </div>
  );
} 