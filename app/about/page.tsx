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

  const milestones = [
    { year: "2012", title: "Foundation", description: "GLG Capital Group LLC established in Wyoming" },
    { year: "2015", title: "Expansion", description: "First international office opened" },
    { year: "2018", title: "Innovation", description: "Launch of digital investment platform" },
    { year: "2021", title: "Growth", description: "Assets under management reach $2B milestone" },
    { year: "2024", title: "Leadership", description: "Recognized as top-tier investment institution" }
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

      {/* TIMELINE SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Our Journey</h2>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'var(--accent)', transform: 'translateX(-50%)' }}></div>
          {milestones.map((milestone, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '3rem',
              flexDirection: index % 2 === 0 ? 'row' : 'row-reverse'
            }}>
              <div style={{ 
                flex: 1, 
                textAlign: index % 2 === 0 ? 'right' : 'left',
                padding: index % 2 === 0 ? '0 2rem 0 0' : '0 0 0 2rem'
              }}>
                <div style={{ background: 'var(--secondary)', padding: '1.5rem', borderRadius: 12, border: '2px solid var(--accent)' }}>
                  <div style={{ color: 'var(--accent)', fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{milestone.year}</div>
                  <div style={{ color: 'var(--primary)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{milestone.title}</div>
                  <div style={{ color: 'var(--foreground)', fontSize: 15 }}>{milestone.description}</div>
                </div>
              </div>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                background: 'var(--accent)', 
                borderRadius: '50%', 
                border: '4px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 1
              }}></div>
              <div style={{ flex: 1 }}></div>
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
            Reserved Area
          </a>
        </div>
      </section>

    </main>
  )
}
