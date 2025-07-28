"use client";
export const dynamic = "force-dynamic";
import { InvestmentFormData } from "@/types/investment";
import SimpleChatBot from "@/components/SimpleChatBot";

export default function HomePage() {
  return (
    <>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem', background: '#fff' }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '4rem', padding: '3rem 0' }}>
        <h1 style={{ 
          color: '#0a2540', 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          GLG Capital Consulting LLC
        </h1>
        <blockquote style={{
          fontSize: '1.25rem',
          color: '#0a2540',
          fontWeight: 600,
          background: '#f5f8fa',
          borderLeft: '6px solid #f59e0b',
          borderRadius: 8,
          margin: '0 auto 2.5rem',
          padding: '1.5rem 2rem',
          maxWidth: 800,
          boxShadow: '0 2px 12px rgba(10,37,64,0.06)'
        }}>
          Our Core Business:<br />
          <span style={{ fontWeight: 400, color: '#1a3556', fontSize: '1.1rem', display: 'block', marginTop: 12 }}>
            "Empower your vision. Through our premium share-pledge framework, trailblazing enterprises harness strategic capital to dominate tomorrow's markets—fueling exponential growth, unshakable resilience, and enduring legacy. Align with us, and command the future with unmatched financial mastery."
          </span>
        </blockquote>
        <p style={{ 
          color: '#fff',
          fontSize: '1.4rem', 
          lineHeight: 1.6,
          maxWidth: 800,
          margin: '0 auto 2rem'
        }}>
          GLG Capital Group LLC is an innovative and results-driven investment firm committed to providing tailored financial solutions and sustainable growth strategies for private clients, institutions, and businesses. Headquartered in the United States, our mission is to guide our partners toward financial success through a strategic, transparent, and client-focused approach.
        </p>
      </section>

      {/* SUMMARY BOX SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)', 
          color: 'white', 
          padding: '3rem', 
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(10,37,64,0.15)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            alignItems: 'start'
          }}>
            
            {/* Key Feature 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                💼
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Equity Pledge System
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                Innovative financing model with fixed returns secured by company shares
              </p>
            </div>

            {/* Key Feature 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                🌍
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Global Reach
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                US-based financial services company with international expertise
              </p>
            </div>

            {/* Key Feature 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                📈
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Proven Results
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                Strategic capital solutions driving exponential growth
              </p>
            </div>

            {/* Key Feature 4 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem'
              }}>
                🛡️
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Secure & Compliant
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                Full regulatory compliance with robust security measures
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Our Services
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          
          {/* Service 1 */}
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Equity Pledge Financing
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6, 
              marginBottom: '1rem' 
            }}>
              Our innovative equity pledge system allows companies to secure financing by pledging shares as collateral. This approach provides fixed returns while maintaining ownership control.
            </p>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Fixed return rates</li>
              <li>Share-based collateral</li>
              <li>Maintained ownership</li>
              <li>Flexible terms</li>
            </ul>
          </div>

          {/* Service 2 */}
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Investment Consulting
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6, 
              marginBottom: '1rem' 
            }}>
              Strategic investment advisory services tailored to your specific financial goals and risk tolerance.
            </p>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Portfolio management</li>
              <li>Risk assessment</li>
              <li>Market analysis</li>
              <li>Performance tracking</li>
            </ul>
          </div>

          {/* Service 3 */}
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Corporate Financing
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6, 
              marginBottom: '1rem' 
            }}>
              Comprehensive financial solutions for businesses seeking growth capital and strategic partnerships.
            </p>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Growth capital</li>
              <li>Strategic partnerships</li>
              <li>Mergers & acquisitions</li>
              <li>Financial restructuring</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', 
          padding: '3rem', 
          borderRadius: 16,
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ 
            color: '#0a2540', 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            About GLG Capital Group
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Our Mission
              </h3>
              <p style={{ 
                color: '#1a3556', 
                lineHeight: 1.6 
              }}>
                To provide innovative financial solutions that empower businesses and individuals to achieve sustainable growth and long-term success through strategic capital management and investment consulting.
              </p>
            </div>
            <div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Our Values
              </h3>
              <p style={{ 
                color: '#1a3556', 
                lineHeight: 1.6 
              }}>
                Integrity, transparency, and client-focused approach drive everything we do. We believe in building lasting partnerships based on trust and mutual success.
              </p>
            </div>
            <div>
              <h3 style={{ 
                color: '#0a2540', 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                marginBottom: '1rem' 
              }}>
                Our Expertise
              </h3>
              <p style={{ 
                color: '#1a3556', 
                lineHeight: 1.6 
              }}>
                With years of experience in financial services, our team brings deep expertise in equity pledge financing, investment consulting, and strategic capital management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #0a2540 0%, #1a3556 100%)', 
          color: 'white', 
          padding: '3rem', 
          borderRadius: 16,
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 800, 
            marginBottom: '1.5rem' 
          }}>
            Partnership with PentaWash
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: 800,
            margin: '0 auto 2rem'
          }}>
            GLG Capital Group LLC is proud to partner with PentaWash, a leading provider of innovative cleaning solutions. Together, we offer comprehensive financial and operational support for businesses in the cleaning industry.
          </p>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '2rem', 
            borderRadius: 12,
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              PentaWash Services
            </h3>
            <p style={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.6, 
              marginBottom: '1rem' 
            }}>
              Professional cleaning solutions for commercial and residential properties, including advanced equipment and eco-friendly products.
            </p>
            <p style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
              For more information, contact us: <strong>www.pentawash.com</strong>
            </p>
          </div>

        </div>
      </section>

      {/* JOIN US SECTION */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Join Us
        </h2>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.2rem', 
          lineHeight: 1.7,
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Whether you are an individual investor, a growing business, or a financial institution, GLG Capital Group LLC is the ideal partner to help you achieve your goals. Contact us today to learn how we can help you build a more secure and prosperous financial future.
        </p>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            color: '#0a2540', 
            fontSize: '2rem', 
            fontWeight: 700, 
            marginBottom: '0.5rem' 
          }}>
            GLG Capital Group LLC
          </h3>
          <p style={{ 
            color: '#1a3556', 
            fontSize: '1.3rem', 
            fontWeight: 600 
          }}>
            Investing in your success.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section style={{ 
        background: '#0a2540', 
        color: 'white', 
        padding: '3rem', 
        borderRadius: 16,
        textAlign: 'center'
      }}>
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
          maxWidth: 600,
          margin: '0 auto'
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
            <a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: '#60a5fa' }}>
              corefound@glgcapitalgroupllc.com
            </a>
          </p>
          <p style={{ fontSize: '1.1rem' }}>
            Phone: +1 307 263 0876
          </p>
        </div>
      </section>

    </main>
    
    {/* Direct Debug Element */}
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'red',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      Direct Debug: Loaded ✅
    </div>
    
    {/* Simple ChatBot Component */}
    <SimpleChatBot />
  </>
  );
}
