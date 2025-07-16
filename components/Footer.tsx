import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(245,158,11,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 50%)',
        zIndex: 1
      }}></div>
      
      {/* Main Footer Content */}
      <div style={{ 
        maxWidth: '80rem', 
        margin: '0 auto', 
        padding: '4rem 1rem', 
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>G</span>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>GLG Capital Group LLC</div>
                <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Financial Services</div>
              </div>
            </div>
            <p style={{ 
              color: '#cbd5e1', 
              marginBottom: '1.5rem', 
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}>
              Professional financial services and investment solutions. 
              Specializing in equity pledge systems and corporate financing.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ color: 'white', fontSize: '0.875rem' }}>📧</span>
              </div>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ color: 'white', fontSize: '0.875rem' }}>📱</span>
              </div>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ color: 'white', fontSize: '0.875rem' }}>💼</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Our Services</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/equity-pledge" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Equity Pledge System
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Corporate Financing
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Investment Advisory
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Financial Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Quick Links</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <Link href="/about" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/register" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Register
                </Link>
              </li>
              <li>
                <Link href="/admin/login" style={{ 
                  color: '#cbd5e1', 
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontSize: '0.95rem'
                }}>
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '0.5rem'
                }}></div>
                <div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>GLG Capital Group LLC</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Financial Services Company</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '0.5rem'
                }}></div>
                <div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                    Email: <a href="mailto:info@glgcapitalgroupllc.com" style={{ color: '#f59e0b', textDecoration: 'none' }}>
                      info@glgcapitalgroupllc.com
                    </a>
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '0.5rem'
                }}></div>
                <div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>Professional Financial Services</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Investment & Advisory</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div style={{ 
          borderTop: '1px solid #475569', 
          marginTop: '3rem', 
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            © 2024 GLG Capital Group LLC. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/contact" style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.2s ease'
            }}>
              Privacy Policy
            </Link>
            <Link href="/contact" style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.2s ease'
            }}>
              Terms of Service
            </Link>
            <Link href="/contact" style={{ 
              color: '#94a3b8', 
              textDecoration: 'none',
              fontSize: '0.875rem',
              transition: 'color 0.2s ease'
            }}>
              Legal Notice
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 