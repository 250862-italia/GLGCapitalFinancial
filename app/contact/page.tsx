"use client"

import { useState } from 'react';
import Link from "next/link"
import { ArrowLeft, MapPin, Mail, Clock, Phone, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    service: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        service: 'general'
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
          Contact Us
        </h1>
        <p style={{ 
          color: '#1a3556', 
          fontSize: '1.4rem', 
          lineHeight: 1.6,
          maxWidth: 800,
          margin: '0 auto'
        }}>
          Get in touch with GLG Capital Group LLC. We're here to help you achieve your financial goals and explore partnership opportunities.
        </p>
      </section>

      {/* CONTACT INFORMATION */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Get In Touch
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          
          {/* Headquarters */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <MapPin size={48} style={{ color: '#0a2540', margin: '0 auto 1rem auto', display: 'block' }} />
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
          </div>

          {/* Phone */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <Phone size={48} style={{ color: '#0a2540', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Phone
            </h3>
            <p style={{ fontSize: '1.1rem' }}>
              Phone: +1 786 798 8311
            </p>
          </div>

          {/* Email */}
          <div style={{ 
            background: '#fff', 
            padding: '2rem', 
            borderRadius: 12, 
            boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <Mail size={48} style={{ color: '#0a2540', margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ 
              color: '#0a2540', 
              fontSize: '1.4rem', 
              fontWeight: 700, 
              marginBottom: '1rem' 
            }}>
              Email
            </h3>
            <p style={{ 
              color: '#1a3556', 
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}>
              <a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                corefound@glgcapitalgroupllc.com
              </a>
            </p>
          </div>

        </div>
      </section>

      {/* ITALIAN PARTNERS */}
      <section style={{ marginBottom: '4rem', padding: '3rem', background: '#f8fafc', borderRadius: 16 }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Our Italian Partners
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
              Magnificus Dominus Consulting Europe Srl
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              <strong>Exclusive Partner for Italy</strong><br />
              Specialized in strategic development, consultancy, and high-value project management.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Website: <a href="https://www.magnificusdominus.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>www.magnificusdominus.com</a>
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
              Sustainability Partners
            </h3>
            <p style={{ 
              color: '#1a3556', 
              lineHeight: 1.6,
              marginBottom: '1rem'
            }}>
              <strong>Wash The World & Pentawash</strong><br />
              Partners in sustainable innovation and plastic waste reduction initiatives.
            </p>
            <p style={{ color: '#1a3556', fontSize: '0.9rem' }}>
              Websites: <a href="https://www.washtheworld.it" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>washtheworld.it</a> | <a href="https://www.pentawash.com" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>pentawash.com</a>
            </p>
          </div>

        </div>
      </section>

      {/* CONTACT FORM */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ 
          color: '#0a2540', 
          fontSize: '2.5rem', 
          fontWeight: 800, 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Send Us a Message
        </h2>
        
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          background: '#fff',
          padding: '3rem',
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          
          {isSubmitted ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              background: '#f0fdf4',
              borderRadius: 12,
              border: '1px solid #bbf7d0'
            }}>
              <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 1rem auto', display: 'block' }} />
              <h3 style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Message Sent Successfully!
              </h3>
              <p style={{ color: '#166534', fontSize: '1.1rem' }}>
                Thank you for contacting GLG Capital Group LLC. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 600, 
                    color: '#374151' 
                  }}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      boxSizing: 'border-box'
                    }}
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  Service of Interest
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="general">General Inquiry</option>
                  <option value="business-structuring">Business Structuring & Financing</option>
                  <option value="valuation">Valuation & Risk Management</option>
                  <option value="advisory">Advisory & Asset Restructuring</option>
                  <option value="investments">Investments Research & Assistance</option>
                  <option value="real-estate">Auction Real Estate Marketplace</option>
                  <option value="partnership">Partnership Opportunities</option>
                </select>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 600, 
                  color: '#374151' 
                }}>
                  Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                  placeholder="Tell us about your project or inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting ? '#9ca3af' : '#0a2540',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: 20,
                      height: 20,
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* BUSINESS HOURS */}
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
          Business Hours
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          maxWidth: 800,
          margin: '0 auto'
        }}>
          
          <div>
            <Clock size={32} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Monday - Friday
            </h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              9:00 AM - 6:00 PM (EST)
            </p>
          </div>

          <div>
            <Clock size={32} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Saturday
            </h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              10:00 AM - 2:00 PM (EST)
            </p>
          </div>

          <div>
            <Clock size={32} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Sunday
            </h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Closed
            </p>
          </div>

        </div>
        
        <p style={{ 
          fontSize: '1.1rem', 
          marginTop: '2rem',
          opacity: 0.9
        }}>
          For urgent matters outside business hours, please email us and we'll respond as soon as possible.
        </p>
      </section>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </main>
  )
}
