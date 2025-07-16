"use client";
export const dynamic = "force-dynamic";
import { InvestmentFormData } from "@/types/investment";

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(245,158,11,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(16,185,129,0.05) 0%, transparent 50%)
          `,
          zIndex: 1
        }}></div>
        
        {/* Floating Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.1) 100%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 2
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
          zIndex: 2
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', padding: '2rem' }}>
          {/* Badge */}
          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: '#0f172a',
            padding: '0.75rem 2rem',
            borderRadius: '50px',
            display: 'inline-block',
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '2rem',
            boxShadow: '0 8px 25px rgba(245,158,11,0.3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            🚀 Premium Investment Solutions
          </div>
          
          {/* Main Title */}
          <h1 style={{ 
            color: '#ffffff', 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: 900, 
            marginBottom: '2rem',
            lineHeight: 1.1,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            GLG Capital Group LLC
          </h1>
          
          {/* Subtitle */}
          <p style={{ 
            color: '#cbd5e1',
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', 
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto 3rem',
            fontWeight: 300
          }}>
            <strong style={{ color: '#f59e0b' }}>Empower your vision.</strong> Through our premium share-pledge framework, 
            trailblazing enterprises harness strategic capital to dominate tomorrow's markets—fueling exponential growth, 
            unshakable resilience, and enduring legacy.
          </p>
          
          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginTop: '3rem'
          }}>
            <a href="/register" style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              color: '#0f172a',
              padding: '1.25rem 2.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(245,158,11,0.3)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 16px 45px rgba(245,158,11,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(245,158,11,0.3)';
            }}
            >
              Start Investing Now →
            </a>
            <a href="/equity-pledge" style={{
              background: 'transparent',
              color: '#ffffff',
              padding: '1.25rem 2.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              display: 'inline-block',
              border: '2px solid #f59e0b',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section style={{ 
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', 
              color: '#0f172a', 
              padding: '3rem 2rem', 
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(245,158,11,0.2)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>$500M+</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Assets Under Management</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
              color: 'white', 
              padding: '3rem 2rem', 
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(15,23,42,0.15)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>15+</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Years of Excellence</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
              color: 'white', 
              padding: '3rem 2rem', 
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(5,150,105,0.2)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>98%</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Client Satisfaction</div>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', 
              color: 'white', 
              padding: '3rem 2rem', 
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(124,58,237,0.2)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>500+</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Global Clients</div>
            </div>
          </div>

          {/* FEATURES SECTION */}
          <div style={{ 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
            color: 'white', 
            padding: '4rem 3rem', 
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(15,23,42,0.15)'
          }}>
            <h2 style={{ 
              textAlign: 'center', 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Why Choose GLG Capital?
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '3rem',
              alignItems: 'start'
            }}>
              
              {/* Feature 1 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(245,158,11,0.2)', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  border: '2px solid rgba(245,158,11,0.3)'
                }}>
                  💼
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f59e0b' }}>
                  Equity Pledge System
                </h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
                  Innovative financing model with fixed returns secured by company shares, providing stability and growth potential.
                </p>
              </div>

              {/* Feature 2 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(16,185,129,0.2)', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  border: '2px solid rgba(16,185,129,0.3)'
                }}>
                  🌍
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#10b981' }}>
                  Global Reach
                </h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
                  US-based financial services company with international expertise and a network spanning multiple continents.
                </p>
              </div>

              {/* Feature 3 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(124,58,237,0.2)', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  border: '2px solid rgba(124,58,237,0.3)'
                }}>
                  📈
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#8b5cf6' }}>
                  Proven Results
                </h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
                  Strategic capital solutions driving exponential growth and resilience for forward-thinking enterprises.
                </p>
              </div>

              {/* Feature 4 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(239,68,68,0.2)', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  border: '2px solid rgba(239,68,68,0.3)'
                }}>
                  🛡️
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#ef4444' }}>
                  Secure & Compliant
                </h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.9 }}>
                  Full regulatory compliance with robust security measures protecting your investments and data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ 
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            marginBottom: '2rem',
            color: 'white'
          }}>
            Ready to Start Your Investment Journey?
          </h2>
          <p style={{ 
            fontSize: '1.25rem', 
            lineHeight: 1.6,
            marginBottom: '3rem',
            color: '#cbd5e1'
          }}>
            Join hundreds of successful investors who trust GLG Capital for their financial growth and stability.
          </p>
          <a href="/register" style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: '#0f172a',
            padding: '1.5rem 3rem',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.25rem',
            display: 'inline-block',
            transition: 'all 0.3s ease',
            boxShadow: '0 12px 35px rgba(245,158,11,0.3)',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 16px 45px rgba(245,158,11,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(245,158,11,0.3)';
          }}
          >
            Get Started Today →
          </a>
        </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
} 