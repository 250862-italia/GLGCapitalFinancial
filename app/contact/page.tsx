"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1>Contact Us</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Your Name" required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <input type="email" placeholder="Your Email" required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
        <textarea placeholder="Your Message" required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', minHeight: 100 }} />
        <button type="submit" style={{ background: '#0a2540', color: '#fff', padding: '0.75rem', border: 'none', borderRadius: 4, fontWeight: 600 }}>Send</button>
      </form>
      <div style={{ marginTop: '2rem', color: '#555' }}>
        <p>Email: info@glgcapitalgroupllc.com</p>
        <p>Phone: +1 (555) 123-4567</p>
        <p>Address: 123 Wall Street, New York, NY</p>
      </div>
    </main>
  )
}
