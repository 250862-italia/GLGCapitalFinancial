"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ChatbotWrapper from '@/components/ui/ChatbotWrapper'
import FinancialNews from '@/components/ui/FinancialNews'
import StockTicker from '@/components/ui/StockTicker'
import NotificationSystem from '@/components/ui/NotificationSystem'

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
        background: 'var(--background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 50, 
            height: 50, 
            border: '4px solid var(--accent)', 
            borderTop: '4px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--foreground)', fontSize: 18 }}>Loading GLG Capital Group...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* STOCK TICKER */}
      <StockTicker />
      
      {/* HERO SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #1a3556 100%)', 
        color: 'var(--secondary)', 
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
          
          <blockquote style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            background: 'rgba(255,255,255,0.1)',
            borderLeft: '6px solid var(--accent)',
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
            <Link href="/iscriviti" style={{
              background: 'var(--accent)',
              color: 'var(--primary)',
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
              color: 'var(--secondary)',
              padding: '1rem 2rem',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              border: '2px solid var(--secondary)',
              transition: 'all 0.3s ease'
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section style={{ padding: '4rem 2rem', background: 'var(--background)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            color: 'var(--primary)', 
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
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Direct Business Structuring & Financing
              </h3>
              <ul style={{ 
                color: 'var(--foreground)', 
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
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Valuation & Risk Management
              </h3>
              <ul style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Asset valuations and transfer appraisals</li>
                <li>Due Diligence and Business Planner</li>
                <li>Drafting and assisting in AP&C (Asset Adjustment and Capitalization)</li>
                <li>Operational plans (Services to support AP&C)</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Advisory & Asset Restructuring
              </h3>
              <ul style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Enhancement of Corporate and Intangible Assets</li>
                <li>REOCO Structures Services</li>
                <li>Real Estate and Real Estate portfolio management and strategy</li>
              </ul>
            </div>

            {/* Service 4 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Investments Research & Assistance
              </h3>
              <ul style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Research and assistance for professional and qualified investors</li>
                <li>Purchase and credit management services through qualified private banking investors and SGRs</li>
              </ul>
            </div>

            {/* Service 5 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Auction Real Estate Marketplace
              </h3>
              <ul style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                paddingLeft: '1.5rem'
              }}>
                <li>Marketplace of credit assignment and real estate rights</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* FINANCIAL NEWS SECTION */}
      <section style={{ padding: '4rem 2rem', background: 'var(--accent)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            color: 'var(--primary)', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Latest Financial News
          </h2>
          <FinancialNews />
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section style={{ padding: '4rem 2rem', background: 'var(--background)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            color: 'var(--primary)', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Our Italian Partners
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '2rem' 
          }}>
            
            {/* Partner 1 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Magnificus Dominus Consulting Europe Srl – Exclusive Partner for Italy
              </h3>
              <p style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                GLG Capital Group has entrusted <strong>Magnificus Dominus Consulting Europe Srl</strong> with the exclusive management of its business operations in Italy. As a specialized firm in strategic development, consultancy, and high-value project management, Magnificus Dominus ensures the growth and consolidation of GLG's initiatives in the Italian market.
              </p>
              <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                For more information: <strong>www.magnificusdominusconsulting.com</strong>
              </p>
            </div>

            {/* Partner 2 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Wash The World – Innovating for a Plastic-Free Future
              </h3>
              <p style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                Wash The World is a pioneering association dedicated to promoting plastic waste reduction by identifying and introducing <strong>innovative, sustainable products</strong> to the market. With a strong commitment to environmental awareness and practical solutions.
              </p>
              <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                For more information: <strong>https://www.washtheworld.it</strong>
              </p>
            </div>

            {/* Partner 3 */}
            <div style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Pentawash – The First Wash The World Approved Product
              </h3>
              <p style={{ 
                color: 'var(--foreground)', 
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                Pentawash is the first <strong>Wash The World</strong> approved product, embodying our mission to reduce plastic waste through innovative and sustainable solutions. Designed to revolutionize laundry care.
              </p>
              <p style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                For more information: <strong>www.pentawash.com</strong>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ 
        background: 'var(--primary)', 
        color: 'var(--secondary)', 
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '2rem' 
          }}>
            Contact Us
          </h2>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '2rem', 
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              GLG CAPITAL GROUP
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              1309 Coffeen Avenue STE 1200<br />
              Sheridan, Wyoming 82801
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: 'var(--accent)' }}>
                corefound@glgcapitalgroupllc.com
              </a>
            </p>
            <p style={{ fontSize: '1.1rem' }}>
              Phone: +1 307 263 0876
            </p>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      <ChatbotWrapper />
      
      {/* NOTIFICATION SYSTEM */}
      <NotificationSystem userId="guest" />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
} 