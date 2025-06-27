"use client"
import { useState, useEffect } from 'react'
import { Globe, TrendingUp, DollarSign, Building, Clock } from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  summary: string
  category: string
  time: string
  source: string
  icon: any
}

export default function FinancialNews() {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0)

  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Rate Cuts in 2024",
      summary: "The Federal Reserve's latest meeting minutes indicate a dovish stance, with policymakers considering interest rate reductions as inflation continues to moderate.",
      category: "Monetary Policy",
      time: "2 hours ago",
      source: "Bloomberg",
      icon: DollarSign
    },
    {
      id: 2,
      title: "Global Markets Rally on Tech Earnings Surge",
      summary: "Major indices hit new highs as technology companies report stronger-than-expected quarterly results, driven by AI investments and cloud computing growth.",
      category: "Markets",
      time: "4 hours ago",
      source: "Reuters",
      icon: TrendingUp
    },
    {
      id: 3,
      title: "European Central Bank Maintains Hawkish Stance",
      summary: "ECB President Lagarde emphasizes continued vigilance on inflation, suggesting rates may remain elevated despite economic slowdown concerns.",
      category: "Central Banks",
      time: "6 hours ago",
      source: "Financial Times",
      icon: Building
    },
    {
      id: 4,
      title: "Emerging Markets Show Resilience Amid Global Uncertainty",
      summary: "Developing economies demonstrate surprising strength as commodity prices stabilize and local currencies gain against major currencies.",
      category: "Emerging Markets",
      time: "8 hours ago",
      source: "CNBC",
      icon: Globe
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [newsItems.length])

  const currentNews = newsItems[currentNewsIndex]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      borderRadius: 12,
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(10,37,64,0.08)',
      border: '1px solid #e0e3eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <Globe size={24} style={{ color: 'var(--accent)' }} />
        <h3 style={{
          color: 'var(--primary)',
          fontSize: 20,
          fontWeight: 700,
          margin: 0
        }}>
          Global Financial News
        </h3>
        <div style={{
          width: '8px',
          height: '8px',
          background: '#10b981',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}></div>
      </div>

      <div style={{
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <currentNews.icon size={20} style={{ color: 'var(--accent)', marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'var(--accent)',
                color: 'var(--primary)',
                padding: '0.25rem 0.75rem',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600
              }}>
                {currentNews.category}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: 12,
                color: 'var(--foreground)',
                opacity: 0.7
              }}>
                <Clock size={12} />
                {currentNews.time}
              </div>
              <span style={{
                fontSize: 12,
                color: 'var(--foreground)',
                opacity: 0.7,
                fontWeight: 600
              }}>
                {currentNews.source}
              </span>
            </div>
            
            <h4 style={{
              color: 'var(--primary)',
              fontSize: 16,
              fontWeight: 700,
              marginBottom: '0.75rem',
              lineHeight: 1.4
            }}>
              {currentNews.title}
            </h4>
            
            <p style={{
              color: 'var(--foreground)',
              fontSize: 14,
              lineHeight: 1.5,
              margin: 0,
              opacity: 0.9
            }}>
              {currentNews.summary}
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1.5rem'
      }}>
        {newsItems.map((_, index) => (
          <div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: index === currentNewsIndex ? 'var(--accent)' : '#d1d5db',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
} 