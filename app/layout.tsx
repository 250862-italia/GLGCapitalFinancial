import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

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
      <body className={inter.className}>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.5rem 0', background: '#0a2540', color: '#fff', fontWeight: 600 }}>
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
