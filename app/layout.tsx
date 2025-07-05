"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider } from '../hooks/use-auth'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInReservedArea, setIsInReservedArea] = useState(false)
  const router = useRouter()

  useEffect(() => {
    console.log('🔑 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    // Check if there is a logged in user (user or admin)
    const user = localStorage.getItem('user')
    const adminUser = localStorage.getItem('admin_user')
    setIsLoggedIn(!!user || !!adminUser)
    
    // Check if we're in a reserved area
    const pathname = window.location.pathname
    const reservedPaths = ['/dashboard', '/profile', '/kyc', '/investments', '/admin']
    setIsInReservedArea(reservedPaths.some(path => pathname.startsWith(path)))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    router.push('/')
    setIsLoggedIn(false)
  }

  return (
    <html lang="en">
      <body style={{ background: 'var(--background)', minHeight: '100vh', fontFamily: 'Inter, Open Sans, Roboto, sans-serif' }}>
        <AuthProvider>
        {/* HEADER - Hidden in reserved areas */}
        {!isInReservedArea && (
          <header style={{ background: 'var(--primary)', padding: '2rem 0', textAlign: 'center', borderBottom: '1px solid #e0e3eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={60} height={60} style={{ borderRadius: 8, background: '#fff' }} />
              <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 700, margin: 0, background: 'var(--secondary)', padding: '0.5rem 1.5rem', borderRadius: 8 }}>GLG Capital Group LLC</h1>
            </div>
            <p style={{ color: 'var(--foreground)', fontSize: 18, marginTop: 8 }}>Empowering Your Financial Future</p>
          </header>
        )}
        
        {/* CLIENT NAVIGATION - Hidden in reserved areas */}
        {!isInReservedArea && (
          <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.25rem 0', background: 'var(--secondary)', color: 'var(--primary)', fontWeight: 600, fontSize: 18, borderBottom: '1px solid #e0e3eb' }}>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <Link href="/equity-pledge" style={{ color: 'var(--primary)' }}>Equity-Pledge</Link>
            <Link href="/about" style={{ color: 'var(--primary)' }}>About Us</Link>
            <Link href="/contact" style={{ color: 'var(--primary)' }}>Contact</Link>
            <div style={{ marginLeft: '2rem', display: 'flex', gap: '1rem' }}>
              <Link href="/admin/login" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,40,49,0.07)' }}>Admin Console</Link>
              <Link href="/login" style={{ background: '#059669', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,40,49,0.07)' }}>Login</Link>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 6,
                    fontWeight: 700,
                    border: 'none',
                    marginLeft: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(34,40,49,0.07)'
                  }}
                >
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
        
        <main style={{ 
          minHeight: isInReservedArea ? '100vh' : '70vh',
          marginTop: isInReservedArea ? 0 : undefined
        }}>{children}</main>
        
        {/* FOOTER - Hidden in reserved areas */}
        {!isInReservedArea && (
          <footer style={{ background: 'var(--primary)', color: 'var(--secondary)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid #e0e3eb', marginTop: 40 }}>
            <div style={{ marginBottom: 8 }}>
              <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={40} height={40} style={{ verticalAlign: 'middle', background: '#fff', borderRadius: 6 }} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>GLG Capital Group LLC</div>
            <div style={{ margin: '0.5rem 0', color: 'var(--accent)' }}>Empowering Your Financial Future</div>
            <div style={{ fontSize: 14, color: 'var(--secondary)' }}>&copy; {new Date().getFullYear()} GLG Capital Group LLC. All rights reserved.</div>
            <div style={{ marginTop: 24, fontSize: 15, color: 'var(--secondary)', lineHeight: 1.7 }}>
              <div><b>GLG CAPITAL GROUP LLC</b></div>
              <div>1309 Coffeen Avenue STE 1200</div>
              <div>Sheridan, Wyoming 82801</div>
              <div><a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: 'var(--accent)' }}>corefound@glgcapitalgroupllc.com</a></div>
              <div>Phone: +1 307 263 0876</div>
            </div>
          </footer>
        )}
        </AuthProvider>
      </body>
    </html>
  )
}
