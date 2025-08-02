import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false
});

// Forza il rendering dinamico per evitare problemi con useRouter
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <ErrorBoundary>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1 
          }}>
            <Navigation />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
