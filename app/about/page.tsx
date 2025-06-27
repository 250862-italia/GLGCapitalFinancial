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
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '1rem' }}>
        <Image src="/glg capital group llcbianco.png" alt="GLG Capital Group LLC" width={100} height={100} style={{ margin: '0 auto 2rem auto', borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px rgba(34,40,49,0.10)' }} />
        <h1 style={{ color: 'var(--primary)', fontSize: 42, fontWeight: 900, marginBottom: 16, letterSpacing: 1.2 }}>About GLG Capital Group</h1>
        <p style={{ color: 'var(--foreground)', fontSize: 20, lineHeight: 1.6, maxWidth: 800, margin: '0 auto 2rem auto' }}>
          A premier investment institution dedicated to empowering high-net-worth individuals and families 
          with sophisticated investment solutions and exclusive opportunities.
        </p>
        <div style={{ background: 'var(--secondary)', padding: '1.5rem', borderRadius: 12, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Our Mission</div>
          <div style={{ color: 'var(--foreground)', fontSize: 16, fontStyle: 'italic' }}>
            "To preserve and grow our clients' wealth through innovative strategies, personalized service, and unwavering commitment to excellence."
          </div>
        </div>
      </section>

      {/* OFFICIAL WEBSITE BANNER */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #2a3f5f 100%)', 
          borderRadius: 16, 
          padding: '2.5rem', 
          color: '#fff', 
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(10,37,64,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Globe size={32} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 700 }}>Official Website</span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: '1rem', color: 'var(--accent)' }}>
              Visit Our Official Corporate Website
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem auto', opacity: 0.95 }}>
              For comprehensive corporate information, official documentation, and detailed company profiles, 
              visit our official GLG Capital Group LLC website.
            </p>
            <a 
              href="https://www.glgcapitalgroupllc.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'var(--accent)', 
                color: 'var(--primary)', 
                padding: '1rem 2rem', 
                borderRadius: 8, 
                textDecoration: 'none', 
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 4px 16px rgba(218,165,32,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(218,165,32,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(218,165,32,0.3)';
              }}
            >
              <Globe size={20} />
              Visit Official Website
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15,3 21,3 21,9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <div style={{ marginTop: '1rem', fontSize: 14, opacity: 0.8 }}>
              Opens in new window • External link
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Our Core Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {values.map((value, index) => (
            <div key={index} style={{ background: '#f8f9fa', padding: '2rem', borderRadius: 12, textAlign: 'center', border: '2px solid var(--accent)' }}>
              <value.icon size={48} style={{ color: 'var(--accent)', margin: '0 auto 1rem auto', display: 'block' }} />
              <h3 style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{value.title}</h3>
              <p style={{ color: 'var(--foreground)', fontSize: 15, lineHeight: 1.5 }}>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONSULTANTS SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Our Professional Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {consultants.map((consultant, index) => (
            <div key={index} style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 12px rgba(10,37,64,0.08)' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem auto',
                overflow: 'hidden',
                border: '3px solid var(--accent)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={consultant.photo} 
                  alt={consultant.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <h3 style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{consultant.name}</h3>
              <div style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{consultant.role}</div>
              <p style={{ color: 'var(--foreground)', fontSize: 15, lineHeight: 1.5 }}>{consultant.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM SECTION */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Our Expertise</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {team.map((member, index) => (
            <div key={index} style={{ background: 'var(--secondary)', padding: '2rem', borderRadius: 12, textAlign: 'center' }}>
              <Building size={48} style={{ color: 'var(--accent)', margin: '0 auto 1rem auto', display: 'block' }} />
              <h3 style={{ color: 'var(--primary)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{member.name}</h3>
              <div style={{ color: 'var(--accent)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{member.role}</div>
              <p style={{ color: 'var(--foreground)', fontSize: 15, lineHeight: 1.5 }}>{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT CTA */}
      <section style={{ background: 'var(--primary)', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center', marginTop: '3rem' }}>
        <h3 style={{ color: 'var(--secondary)', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Ready to Start Your Journey?</h3>
        <p style={{ color: 'var(--secondary)', fontSize: 18, marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem auto' }}>
          Discover how GLG Capital Group can help you achieve your financial goals with our personalized investment services.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/contact" style={{ 
            background: 'var(--accent)', 
            color: 'var(--primary)', 
            padding: '1rem 2rem', 
            borderRadius: 8, 
            textDecoration: 'none', 
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            Contact Us
          </a>
          <a href="/reserved" style={{ 
            background: 'transparent', 
            color: 'var(--accent)', 
            padding: '1rem 2rem', 
            borderRadius: 8, 
            textDecoration: 'none', 
            fontWeight: 700,
            fontSize: 16,
            border: '2px solid var(--accent)'
          }}>
            Portfolio Dashboard
          </a>
        </div>
      </section>

    </main>
  )
}
