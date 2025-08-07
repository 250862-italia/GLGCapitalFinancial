import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GLG Capital Financial',
  description: 'Sistema di gestione investimenti',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        {children}
      </body>
    </html>
  );
} 