"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Contact GLG Capital Group</h1>
        <p style={{ color: 'var(--foreground)', fontSize: 18, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Get in touch with our team to discuss your investment opportunities and financial goals.
        </p>
      </section>

      {/* CONTACT FORM */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '1.5rem' }}>Send us a Message</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Your Name" 
              required 
              style={{ 
                padding: '1rem', 
                borderRadius: 8, 
                border: '2px solid #e0e3eb', 
                fontSize: 16,
                background: '#f8f9fa'
              }} 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              required 
              style={{ 
                padding: '1rem', 
                borderRadius: 8, 
                border: '2px solid #e0e3eb', 
                fontSize: 16,
                background: '#f8f9fa'
              }} 
            />
          </div>
          <input 
            type="text" 
            placeholder="Subject" 
            required 
            style={{ 
              padding: '1rem', 
              borderRadius: 8, 
              border: '2px solid #e0e3eb', 
              fontSize: 16,
              background: '#f8f9fa'
            }} 
          />
          <textarea 
            placeholder="Your Message" 
            required 
            style={{ 
              padding: '1rem', 
              borderRadius: 8, 
              border: '2px solid #e0e3eb', 
              minHeight: 150, 
              fontSize: 16,
              background: '#f8f9fa',
              resize: 'vertical'
            }} 
          />
          <button 
            type="submit" 
            style={{ 
              background: 'var(--accent)', 
              color: 'var(--primary)', 
              padding: '1rem 2rem', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 700, 
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(218,165,32,0.20)',
              transition: 'all 0.2s ease'
            }}
            className="hover:transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* CONTACT INFO */}
      <section style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 700, marginBottom: '2rem' }}>Contact Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Mail size={32} style={{ color: 'var(--accent)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email</h3>
            <a 
              href="mailto:corefound@glgcapitalgroupllc.com" 
              style={{ 
                color: 'var(--primary)', 
                textDecoration: 'underline',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              corefound@glgcapitalgroupllc.com
            </a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MapPin size={32} style={{ color: 'var(--accent)', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Address</h3>
            <div style={{ color: 'var(--foreground)', fontSize: 16, lineHeight: 1.5 }}>
              GLG Capital Group LLC<br />
              1309 Coffeen Avenue, STE 1200<br />
              Sheridan – WY 82801
            </div>
          </div>
        </div>
      </section>

      {/* BACK TO HOME */}
      <section style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: 'var(--primary)', 
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </section>

    </main>
  )
}
