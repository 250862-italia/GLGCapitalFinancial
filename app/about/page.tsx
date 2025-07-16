"use client"
import Image from "next/image"
import { Award, Shield, Users, Globe, TrendingUp, Building, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: "Integrity & Trust",
      description: "Building lasting relationships through transparency and ethical practices"
    },
    {
      icon: Target,
      title: "Excellence",
      description: "Delivering exceptional service and superior investment performance"
    },
    {
      icon: Users,
      title: "Client-Centric",
      description: "Your success is our priority in every decision we make"
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "Access to worldwide opportunities and diversified strategies"
    }
  ]

  const team = [
    {
      name: "Executive Leadership",
      role: "Strategic Vision",
      description: "Experienced professionals with decades of combined expertise in investment management and financial services"
    },
    {
      name: "Investment Team",
      role: "Portfolio Management",
      description: "Specialized analysts and portfolio managers focused on delivering superior returns"
    },
    {
      name: "Client Relations",
      role: "Personal Service",
      description: "Dedicated relationship managers providing personalized attention to every client"
    }
  ]

  const consultants = [
    {
      name: "Michael Anderson",
      role: "Senior Investment Advisor",
      image: "/consultant1.jpg",
      description: "15+ years experience in global markets and portfolio management. Former VP at Goldman Sachs.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "Sarah Johnson",
      role: "Financial Strategist",
      image: "/consultant2.jpg", 
      description: "Expert in wealth preservation and strategic financial planning. MBA from Harvard Business School.",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "David Chen",
      role: "Market Analyst",
      image: "/consultant3.jpg",
      description: "Specialized in emerging markets and alternative investments. CFA charterholder with 12+ years experience.",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
    }
  ]

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
          About GLG Capital Group LLC
        </h1>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.4rem', 
          lineHeight: 1.6,
          maxWidth: 800,
          margin: '0 auto'
        }}>
          A leading investment firm dedicated to innovative financial solutions and sustainable growth strategies.
        </p>
      </section>

      {/* COMPANY OVERVIEW */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Company Overview
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div>
            <h3 style={{ color: '#0a2540', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Our Mission
            </h3>
            <p style={{ color: '#1a3556', lineHeight: 1.6 }}>
              To guide our partners toward financial success through a strategic, transparent, and client-focused approach. We are committed to providing tailored financial solutions and sustainable growth strategies for private clients, institutions, and businesses.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#0a2540', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Our Vision
            </h3>
            <p style={{ color: '#1a3556', lineHeight: 1.6 }}>
              We believe in the power of innovative ideas, prudent capital management, and long-term partnerships. We strive to be industry leaders by offering solutions that blend advanced market insights with rigorous risk management.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#0a2540', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
              Our Approach
            </h3>
            <p style={{ color: '#1a3556', lineHeight: 1.6 }}>
              We employ a data-driven approach, combining in-depth financial market analysis with our extensive industry expertise. Every investment decision is guided by our dedication to excellence and safeguarding our clients' interests.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Our Core Values
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Extensive Experience
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6
            }}>
              Our team comprises seasoned experts with profound knowledge of global financial markets, bringing decades of combined experience to every client relationship.
            </p>
          </div>

          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Transparency
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6
            }}>
              We operate with utmost integrity, ensuring our clients always have access to clear and up-to-date information about their investments and our processes.
            </p>
          </div>

          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Tangible Results
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6
            }}>
              We focus on delivering solutions that create real, measurable value for our clients, with a track record of successful outcomes and satisfied partners.
            </p>
          </div>

          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Innovation
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6
            }}>
              We remain at the forefront of adopting new technologies and market strategies, continuously evolving to meet the changing needs of our clients.
            </p>
          </div>

        </div>
      </section>

      {/* SERVICES DETAILED */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Our Comprehensive Services
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          
          <div>
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
              <li>Creation of business attraction strategies</li>
            </ul>
          </div>

          <div>
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
              <li>Due Diligence and Business Planner services</li>
              <li>Drafting and assisting in AP&C (Asset Adjustment and Capitalization)</li>
              <li>Operational plans and support services</li>
            </ul>
          </div>

          <div>
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
              <li>Real Estate portfolio management and strategy</li>
              <li>Comprehensive restructuring solutions</li>
            </ul>
          </div>

          <div>
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
              <li>Research and assistance for professional investors</li>
              <li>Purchase and credit management services</li>
              <li>Private banking investor connections</li>
              <li>SGR (Società di Gestione del Risparmio) partnerships</li>
            </ul>
          </div>

          <div>
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
              <li>Marketplace of credit assignment</li>
              <li>Real estate rights management</li>
              <li>Auction platform services</li>
              <li>Property investment opportunities</li>
            </ul>
          </div>

        </div>
      </section>

      {/* GLOBAL PRESENCE */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Global Presence & Partnerships
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
          
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
              Headquarters
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              <strong>GLG Capital Group LLC</strong><br />
              1309 Coffeen Avenue STE 1200<br />
              Sheridan, Wyoming 82801<br />
              United States
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Phone: +1 307 263 0876<br />
              Email: corefound@glgcapitalgroupllc.com
            </p>
          </div>

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
              Italian Operations
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              <strong>GLG Capital Group LLC</strong><br />
              Exclusive Partner for Italy<br />
              Specialized in strategic development, consultancy, and high-value project management.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Website: www.magnificusdominus.com
            </p>
          </div>

        </div>
      </section>

      {/* SUSTAINABILITY INITIATIVES */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Sustainability & Innovation Initiatives
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          
          <div>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Wash The World Partnership
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              A pioneering association dedicated to promoting plastic waste reduction by identifying and introducing innovative, sustainable products to the market. Through research, partnerships, and education, we empower individuals and businesses to embrace eco-friendly alternatives.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Website: https://www.washtheworld.it
            </p>
          </div>

          <div>
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Pentawash - Sustainable Innovation
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              The first Wash The World approved product, embodying our mission to reduce plastic waste through innovative and sustainable solutions. Designed to revolutionize laundry care, Pentawash offers an eco-friendly, efficient, and plastic-free alternative.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Website: www.pentawash.com
            </p>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION */}
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
          marginBottom: '1.5rem' 
        }}>
          Ready to Partner With Us?
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          lineHeight: 1.7,
          marginBottom: '2rem',
          maxWidth: 800,
          margin: '0 auto 2rem'
        }}>
          Whether you are an individual investor, a growing business, or a financial institution, GLG Capital Group LLC is the ideal partner to help you achieve your goals. Contact us today to learn how we can help you build a more secure and prosperous financial future.
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
            GLG CAPITAL GROUP LLC
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
