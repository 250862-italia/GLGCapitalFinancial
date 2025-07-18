"use client";
export const dynamic = "force-dynamic";
import { InvestmentFormData } from "@/types/investment";

export default function HomePage() {
  return (
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
                US-based financial services company
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
                Strategic capital solutions driving exponential growth and resilience
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
                🔒
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Secure & Transparent
              </h3>
              <p style={{ fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                Robust collateralization and transparent reporting for all investments
              </p>
            </div>

          </div>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <a 
              href="/equity-pledge" 
              style={{
                background: '#f59e0b',
                color: '#0a2540',
                padding: '1rem 2rem',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}
            >
              Learn About Our Equity Pledge System →
            </a>
          </div>
        </div>
      </section>

      {/* VISION SECTION */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Our Vision
        </h2>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.2rem', 
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: 900,
          margin: '0 auto'
        }}>
          At GLG Capital Group, we believe in the power of innovative ideas, prudent capital management, and long-term partnerships. We strive to be industry leaders by offering solutions that blend advanced market insights with rigorous risk management.
        </p>
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
        
        {/* Equity-Pledge Model Block */}
        <div style={{
          background: '#fff',
          border: '2px solid #f59e0b',
          borderRadius: 14,
          boxShadow: '0 4px 20px rgba(245,158,11,0.08)',
          padding: '2.5rem',
          marginBottom: '2.5rem',
          maxWidth: 900,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <h3 style={{
            color: '#f59e0b',
            fontSize: '1.7rem',
            fontWeight: 800,
            marginBottom: '1.2rem',
            textAlign: 'center',
            letterSpacing: 0.5
          }}>
            How Our Equity-Pledge Model Works
          </h3>
          <ul style={{
            color: '#1a3556',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            marginBottom: '1.5rem',
            paddingLeft: '1.5rem',
            maxWidth: 800,
            margin: '0 auto'
          }}>
            <li><b>Dedicated Vehicle:</b> We create a special branch or subsidiary empowered to issue shares exclusively for investors.</li>
            <li><b>Simple Subscription:</b> Investors complete an online form, e-sign the agreement, and wire funds to a segregated account.</li>
            <li><b>Secured by Pledge:</b> Each investment is backed by a formal pledge of those newly issued shares—guaranteeing repayment.</li>
            <li><b>Fixed, Attractive Yield:</b> 12% p.a. gross return (minus a 0.7% management fee), paid at a 36-month maturity.</li>
            <li><b>Transparent Reporting:</b> Quarterly statements keep investors informed of principal and interest accrual.</li>
            <li><b>Automatic Release:</b> On maturity, capital + net yield is wired back and the pledge is lifted—no hidden costs, no surprises.</li>
          </ul>
          <div style={{
            color: '#0a2540',
            fontWeight: 700,
            fontSize: '1.15rem',
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            Empower your growth with predictable returns and rock-solid security.
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          
          {/* Service 1 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
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
              color: '#1a3556', 
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
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Valuation & Risk Management
            </h3>
            <ul style={{ 
              color: '#1a3556', 
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
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Advisory & Asset Restructuring
            </h3>
            <ul style={{ 
              color: '#1a3556', 
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
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Investments Research & Assistance
            </h3>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Research and assistance for professional and qualified investors</li>
              <li>Purchase and credit management services through qualified private banking investors and SGRs</li>
            </ul>
          </div>

          {/* Service 5 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Auction Real Estate Marketplace
            </h3>
            <ul style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              paddingLeft: '1.5rem'
            }}>
              <li>Marketplace of credit assignment and real estate rights</li>
            </ul>
          </div>

        </div>
      </section>

      {/* APPROACH SECTION */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Our Approach
        </h2>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.2rem', 
          lineHeight: 1.7,
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          GLG Capital Group LLC employs a data-driven approach, combining in-depth financial market analysis with our extensive industry expertise. Every investment decision is guided by our dedication to excellence and safeguarding our clients' interests.
        </p>
        
        <h3 style={{ 
          color: '#0a2540', 
          fontSize: '2rem', 
          fontWeight: 700, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Why Choose GLG Capital Group LLC?
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Extensive Experience
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              Our team comprises seasoned experts with profound knowledge of global financial markets.
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Transparency
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              We operate with utmost integrity, ensuring our clients always have access to clear and up-to-date information.
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Tangible Results
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              We focus on delivering solutions that create real, measurable value.
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#0a2540', fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Innovation
            </h4>
            <p style={{ color: '#1a3556', fontSize: '1rem' }}>
              We remain at the forefront of adopting new technologies and market strategies.
            </p>
          </div>
        </div>
      </section>

      {/* ITALIAN PARTNERS SECTION */}
      <section style={{ marginBottom: '4rem' }}>
                <h2 style={{
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Our Partners
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
          


          {/* Partner 2 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Wash The World – Innovating for a Plastic-Free Future
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              Wash The World is a pioneering association dedicated to promoting plastic waste reduction by identifying and introducing <strong>innovative, sustainable products</strong> to the market. With a strong commitment to environmental awareness and practical solutions, Wash The World collaborates with companies, institutions, and communities to drive real change. Through research, partnerships, and education, we empower individuals and businesses to embrace eco-friendly alternatives and contribute to a cleaner planet.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              For more information, contact us: <strong>https://www.washtheworld.it</strong>
            </p>
          </div>

          {/* Partner 3 */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Pentawash – The First Wash The World Approved Product
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              Pentawash is the first <strong>Wash The World</strong> approved product, embodying our mission to reduce plastic waste through innovative and sustainable solutions. Designed to revolutionize laundry care, Pentawash offers an <strong>eco-friendly, efficient, and plastic-free alternative</strong>, making it easier for households to contribute to a cleaner planet. As a pioneer in sustainable home care, Pentawash aligns with our vision of introducing cutting-edge products that support a greener future.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
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
  );
}
