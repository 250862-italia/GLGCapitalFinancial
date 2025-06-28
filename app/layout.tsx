"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ background: 'var(--background)', minHeight: '100vh', fontFamily: 'Inter, Open Sans, Roboto, sans-serif' }}>
        <header style={{ background: 'var(--primary)', padding: '2rem 0', textAlign: 'center', borderBottom: '1px solid #e0e3eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={60} height={60} style={{ borderRadius: 8, background: '#fff' }} />
            <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 700, margin: 0, background: 'var(--secondary)', padding: '0.5rem 1.5rem', borderRadius: 8 }}>GLG Capital Group LLC</h1>
          </div>
          <p style={{ color: 'var(--foreground)', fontSize: 18, marginTop: 8 }}>Empowering Your Financial Future</p>
        </header>
        
        {/* CLIENT NAVIGATION */}
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.25rem 0', background: 'var(--secondary)', color: 'var(--primary)', fontWeight: 600, fontSize: 18, borderBottom: '1px solid #e0e3eb' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
          <Link href="/about" style={{ color: 'var(--primary)' }}>About Us</Link>
          <Link href="/contact" style={{ color: 'var(--primary)' }}>Contact</Link>
          <Link href="/iscriviti" style={{ color: 'var(--primary)' }}>Register</Link>
          <div style={{ marginLeft: '2rem', display: 'flex', gap: '1rem' }}>
            <Link href="/admin/login" style={{ background: 'var(--accent)', color: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,40,49,0.07)' }}>Admin Console</Link>
            <Link href="/iscriviti" style={{ background: '#3b82f6', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: 6, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,40,49,0.07)' }}>Register</Link>
          </div>
        </nav>
        
        <main style={{ minHeight: '70vh' }}>{children}</main>
        
        <footer style={{ background: 'var(--primary)', color: 'var(--secondary)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid #e0e3eb', marginTop: 40 }}>
          <div style={{ marginBottom: 8 }}>
            <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={40} height={40} style={{ verticalAlign: 'middle', background: '#fff', borderRadius: 6 }} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>GLG Capital Group LLC</div>
          <div style={{ margin: '0.5rem 0', color: 'var(--accent)' }}>Empowering Your Financial Future</div>
          <div style={{ fontSize: 14, color: 'var(--secondary)' }}>&copy; {new Date().getFullYear()} GLG Capital Group LLC. All rights reserved.</div>
        </footer>
      </body>
    </html>
  )
}
