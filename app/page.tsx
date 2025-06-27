"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  TrendingUp, 
  Shield, 
  Users, 
  Globe, 
  ArrowRight, 
  Star, 
  CheckCircle,
  DollarSign,
  BarChart3,
  Target,
  Award,
  Building
} from 'lucide-react'
import StockTicker from '@/components/ui/StockTicker'
import FinancialNews from '@/components/ui/FinancialNews'

export default function HomePage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const features = [
    {
      icon: Shield,
      title: "Secure Investment Platform",
      description: "Bank-grade security with advanced encryption and compliance standards"
    },
    {
      icon: TrendingUp,
      title: "Professional Management",
      description: "Expert portfolio management with proven track record"
    },
    {
      icon: Users,
      title: "Personalized Service",
      description: "Dedicated relationship managers for every client"
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Access to worldwide markets and diversified strategies"
    }
  ]

  const packages = [
    {
      name: "Starter Portfolio",
      price: "$50,000",
      features: ["Basic portfolio management", "Monthly reports", "Email support"],
      popular: false
    },
    {
      name: "Premium Portfolio", 
      price: "$250,000",
      features: ["Advanced strategies", "Weekly reports", "Priority support", "Personal advisor"],
      popular: true
    },
    {
      name: "Elite Portfolio",
      price: "$1,000,000+",
      features: ["Custom strategies", "Daily reports", "24/7 support", "Dedicated team"],
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Michael Anderson",
      role: "Private Investor",
      content: "GLG Capital Group has transformed my investment approach. Their expertise and personalized service are unmatched.",
      rating: 5
    },
    {
      name: "Sarah Johnson", 
      role: "Business Owner",
      content: "The level of professionalism and attention to detail is exceptional. I feel confident about my financial future.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Retired Executive", 
      content: "Outstanding service and consistent returns. The team truly understands wealth preservation.",
      rating: 5
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main style={{ 
      maxWidth: 1200, 
      margin: '2rem auto', 
      padding: '2rem', 
      background: '#fff', 
      borderRadius: 16, 
      boxShadow: '0 4px 24px rgba(10,37,64,0.10)' 
    }}>
      
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '1rem' }}>
        <Image 
          src="/glg capital group llcbianco.png" 
          alt="GLG Capital Group LLC" 
          width={120} 
          height={120} 
          style={{ 
            margin: '0 auto 2rem auto', 
            borderRadius: 12, 
            background: '#fff', 
            boxShadow: '0 2px 12px rgba(34,40,49,0.10)' 
          }} 
        />
        <h1 style={{ 
          color: 'var(--primary)', 
          fontSize: 48, 
          fontWeight: 900, 
          marginBottom: 16, 
          letterSpacing: 1.2 
        }}>
          Welcome to GLG Capital Group
        </h1>
        <p style={{ 
          color: 'var(--foreground)', 
          fontSize: 22, 
          lineHeight: 1.6, 
          maxWidth: 800, 
          margin: '0 auto 2rem auto' 
        }}>
          Your trusted partner for sophisticated investment solutions and wealth management. 
          Experience the difference of professional, personalized financial services.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => router.push('/iscriviti')}
            style={{
              background: 'var(--accent)',
              color: 'var(--primary)',
              padding: '1rem 2rem',
              borderRadius: 8,
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
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
            Get Started
            <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => router.push('/about')}
            style={{
              background: 'transparent',
              color: 'var(--primary)',
              padding: '1rem 2rem',
              borderRadius: 8,
              border: '2px solid var(--primary)',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* MARKET TICKER */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: 16, 
          padding: '2rem', 
          color: 'white',
          boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
          border: '2px solid #667eea'
        }}>
          <h2 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            marginBottom: '1rem', 
            textAlign: 'center',
            color: 'white'
          }}>
            Live Market Data
          </h2>
          <StockTicker />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: 'var(--primary)', 
          fontSize: 32, 
          fontWeight: 800, 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          Why Choose GLG Capital Group
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{ 
              background: '#f8f9fa', 
              padding: '2rem', 
              borderRadius: 12, 
              textAlign: 'center', 
              border: '2px solid var(--accent)',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <feature.icon size={48} style={{ 
                color: 'var(--accent)', 
                margin: '0 auto 1rem auto', 
                display: 'block' 
              }} />
              <h3 style={{ 
                color: 'var(--primary)', 
                fontSize: 20, 
                fontWeight: 700, 
                marginBottom: 12 
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: 'var(--foreground)', 
                fontSize: 15, 
                lineHeight: 1.5 
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINANCIAL NEWS */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: 'var(--primary)', 
          fontSize: 32, 
          fontWeight: 800, 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          Latest Financial News
        </h2>
        <FinancialNews />
      </section>

      {/* TESTIMONIALS */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: 'var(--primary)', 
          fontSize: 32, 
          fontWeight: 800, 
          textAlign: 'center', 
          marginBottom: '3rem' 
        }}>
          What Our Clients Say
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={{ 
              background: 'var(--secondary)', 
              padding: '2rem', 
              borderRadius: 12, 
              boxShadow: '0 2px 12px rgba(10,37,64,0.08)' 
            }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
                ))}
              </div>
              <p style={{ 
                color: 'var(--foreground)', 
                fontSize: 16, 
                lineHeight: 1.6, 
                marginBottom: '1rem',
                fontStyle: 'italic'
              }}>
                "{testimonial.content}"
              </p>
              <div>
                <div style={{ 
                  color: 'var(--primary)', 
                  fontWeight: 700, 
                  fontSize: 16 
                }}>
                  {testimonial.name}
                </div>
                <div style={{ 
                  color: 'var(--foreground)', 
                  fontSize: 14 
                }}>
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #2a3f5f 100%)', 
        borderRadius: 16, 
        padding: '3rem', 
        textAlign: 'center',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(10,37,64,0.15)'
      }}>
        <h2 style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          marginBottom: '1rem',
          color: 'var(--accent)'
        }}>
          Ready to Start Your Investment Journey?
        </h2>
        <p style={{ 
          fontSize: 18, 
          lineHeight: 1.6, 
          marginBottom: '2rem',
          maxWidth: 600,
          margin: '0 auto 2rem auto'
        }}>
          Join thousands of satisfied clients who trust GLG Capital Group with their financial future.
        </p>
        <button 
          onClick={() => router.push('/iscriviti')}
          style={{
            background: 'var(--accent)',
            color: 'var(--primary)',
            padding: '1.5rem 3rem',
            borderRadius: 8,
            border: 'none',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto',
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
          Get Started Today
          <ArrowRight size={20} />
        </button>
      </section>
    </main>
  )
}
