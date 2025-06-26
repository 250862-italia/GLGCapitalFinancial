import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GLG Capital Group',
  description: 'Investment Management Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0a2540', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <header style={{ background: '#091a2a', padding: '2rem 0', textAlign: 'center', borderBottom: '1px solid #1a3556' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Image src="/glg-logo.png" alt="GLG Capital Group LLC" width={60} height={60} style={{ borderRadius: 8, background: '#fff' }} />
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: 0 }}>GLG Capital Group LLC</h1>
          </div>
          <p style={{ color: '#b3c6e0', fontSize: 18, marginTop: 8 }}>Empowering Your Financial Future</p>
        </header>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.25rem 0', background: '#10294a', color: '#fff', fontWeight: 600, fontSize: 18, borderBottom: '1px solid #1a3556' }}>
          <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/reserved">Reserved Area</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
