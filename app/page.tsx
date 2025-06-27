"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, DollarSign, Globe, Clock, ArrowRight, CheckCircle, Star } from "lucide-react"
import FinancialNews from "../components/ui/FinancialNews"
import { PackageProvider } from '../lib/package-context';
import StockTicker from '../components/ui/StockTicker';

export default function HomePage() {
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setLastUpdated(new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PackageProvider>
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>$</span>
                </div>
                <div>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0
                  }}>GLG Capital Group LLC</h1>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                  }}>Professional Position Management</p>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <span>🕐 Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>Strategic Partnership</h2>
            <p style={{
              fontSize: '24px',
              marginBottom: '2rem',
              opacity: 0.9
            }}>GLG Capital Group & MD Financial Services</p>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '1rem'
                  }}>Partnership Highlights</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {[
                      'Guaranteed returns framework',
                      'Institutional-grade security',
                      '24/7 portfolio monitoring',
                      'Advanced risk management'
                    ].map((item, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ color: '#10b981' }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '1rem'
                  }}>Performance Metrics</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Portfolio Growth</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>+15.2%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Risk Score</span>
                      <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>Low</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Client Satisfaction</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>98%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <a href="/iscriviti" style={{
                background: '#fbbf24',
                color: '#1f2937',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}>Start Registration</a>
              <a href="/about" style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}>Learn More</a>
            </div>
          </div>
        </section>

        {/* Financial News Section */}
        <section style={{
          padding: '4rem 0',
          background: 'white'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937'
                }}>Live Financial News</h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span>🕐</span>
                  <span>Last update: Today</span>
                </div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  {
                    category: 'Partnership',
                    title: 'GLG Capital Group Announces Strategic Partnership with MD Financial Services',
                    description: 'Major breakthrough in institutional investment services with guaranteed returns framework',
                    source: 'Financial Times',
                    time: '2 hours ago',
                    trend: 'up'
                  },
                  {
                    category: 'Markets',
                    title: 'Global Markets Show Strong Recovery Amid Economic Stability',
                    description: 'Major indices reach new highs as investor confidence strengthens',
                    source: 'Bloomberg',
                    time: '4 hours ago',
                    trend: 'up'
                  },
                  {
                    category: 'Policy',
                    title: 'Federal Reserve Signals Potential Rate Adjustments',
                    description: 'Central bank considers monetary policy changes in response to inflation data',
                    source: 'Reuters',
                    time: '6 hours ago',
                    trend: 'neutral'
                  },
                  {
                    category: 'Technology',
                    title: 'Tech Sector Leads Market Gains with 3.2% Increase',
                    description: 'Technology stocks outperform as earnings season exceeds expectations',
                    source: 'CNBC',
                    time: '8 hours ago',
                    trend: 'up'
                  }
                ].map((news, index) => (
                  <div key={index} style={{
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '1rem',
                    transition: 'background-color 0.2s'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#3b82f6',
                        background: '#dbeafe',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>{news.category}</span>
                      <span style={{
                        color: news.trend === 'up' ? '#10b981' : news.trend === 'down' ? '#ef4444' : '#6b7280'
                      }}>📈</span>
                    </div>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '14px',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>{news.title}</h3>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '0.75rem',
                      lineHeight: '1.4'
                    }}>{news.description}</p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span>{news.source}</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>News updates automatically every 6 hours. Partnership news updates daily.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section style={{
          padding: '4rem 0',
          background: '#f9fafb'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>Our Services</h2>
              <p style={{
                color: '#6b7280'
              }}>Comprehensive financial solutions through our strategic partnership</p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {[
                {
                  icon: '📈',
                  title: 'Portfolio Management',
                  description: 'Professional position management with guaranteed returns and advanced risk controls.'
                },
                {
                  icon: '🌍',
                  title: 'Global Markets',
                  description: 'Access to international markets with real-time monitoring and execution capabilities.'
                },
                {
                  icon: '⭐',
                  title: 'Premium Support',
                  description: '24/7 dedicated support team with personalized financial advisory services.'
                }
              ].map((service, index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'box-shadow 0.2s'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    fontSize: '32px'
                  }}>
                    {service.icon}
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>{service.title}</h3>
                  <p style={{
                    color: '#6b7280'
                  }}>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>Ready to Get Started?</h2>
            <p style={{
              fontSize: '20px',
              color: '#d1d5db',
              marginBottom: '2rem'
            }}>Join thousands of satisfied clients who trust GLG Capital Group for their investment needs.</p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <a href="/iscriviti" style={{
                background: '#fbbf24',
                color: '#1f2937',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}>
                Start Your Journey
                <span>→</span>
              </a>
              <a href="/contact" style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}>Contact Us</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          background: '#1f2937',
          color: 'white',
          padding: '2rem 0',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            <p style={{
              color: '#9ca3af'
            }}>© 2024 GLG Capital Group LLC. All rights reserved. | Strategic Partnership with MD Financial Services</p>
          </div>
        </footer>
      </main>
    </PackageProvider>
  )
}
