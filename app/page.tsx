"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid #0a2540', 
            borderTop: '4px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#1f2937', fontSize: 18 }}>Loading GLG Capital Group...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)', 
        color: '#fff', 
        padding: '4rem 2rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 900, 
            marginBottom: '1.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            GLG Capital Group LLC
          </h1>
          <div style={{
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '2.5rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)'
          }}>
            Empowering Your Financial Future
          </div>
          
          <blockquote style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.1)',
            borderLeft: '6px solid #f59e0b',
            borderRadius: 8,
            margin: '0 auto 2.5rem',
            padding: '2rem',
            maxWidth: 900,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Our Core Business:<br />
            <span style={{ fontWeight: 400, fontSize: '1.2rem', display: 'block', marginTop: 12 }}>
              "Empower your vision. Through our premium share-pledge framework, trailblazing enterprises harness strategic capital to dominate tomorrow's markets—fueling exponential growth, unshakable resilience, and enduring legacy. Align with us, and command the future with unmatched financial mastery."
            </span>
          </blockquote>
          
          <p style={{ 
            fontSize: '1.3rem', 
            lineHeight: 1.6,
            maxWidth: 800,
            margin: '0 auto 2rem',
            opacity: 0.9
          }}>
            GLG Capital Group LLC is an innovative and results-driven investment firm committed to providing tailored financial solutions and sustainable growth strategies for private clients, institutions, and businesses.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: '#f59e0b',
              color: '#0a2540',
              padding: '1rem 2rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}>
              Get Started Today
            </Link>
            <Link href="/contact" style={{
              background: 'transparent',
              color: '#fff',
              padding: '1rem 2rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: '2px solid #fff',
              transition: 'all 0.3s ease'
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section style={{ padding: '4rem 2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            color: '#0a2540', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Our Services
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '2rem' 
          }}>
            
            {/* Service 1 */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Direct Business Structuring & Financing
              </h3>
              <ul style={{ 
                color: '#1f2937', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Direct business structuring to financing through equity market</li>
                <li>Business requirements analysis and business target assessment</li>
                <li>Financial and capital restructuring</li>
                <li>Due diligence for patronage attribution</li>
                <li>Creation of business attraction - "Make the Business More Attractive To Lenders"</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div style={{ 
              background: '#ffffff', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Investment Management & Portfolio Services
              </h3>
              <ul style={{ 
                color: '#1f2937', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Comprehensive investment portfolio management</li>
                <li>Risk assessment and mitigation strategies</li>
                <li>Market analysis and trend forecasting</li>
                <li>Diversification and asset allocation</li>
                <li>Performance monitoring and reporting</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Strategic Financial Consulting
              </h3>
              <ul style={{ 
                color: '#1f2937', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Strategic financial planning and advisory</li>
                <li>Mergers and acquisitions support</li>
                <li>Capital raising and investor relations</li>
                <li>Financial modeling and valuation</li>
                <li>Regulatory compliance and governance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', 
        color: '#fff', 
        padding: '4rem 2rem', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '1.5rem' 
          }}>
            Ready to Start Your Investment Journey?
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            lineHeight: 1.6,
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Join GLG Capital Group LLC and take control of your financial future with our expert guidance and innovative investment solutions.
          </p>
          <Link href="/register" style={{
            background: '#f59e0b',
            color: '#0a2540',
            padding: '1rem 2rem',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}>
            Start Investing Today
          </Link>
        </div>
      </section>
    </div>
  )
} 