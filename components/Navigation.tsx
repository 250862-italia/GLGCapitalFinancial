'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(12px)' : 'none',
      boxShadow: isScrolled ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
      borderBottom: isScrolled ? '1px solid #e2e8f0' : 'none'
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>G</span>
            </div>
            <div style={{ display: 'none' }} className="sm:block">
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: isScrolled ? '#1e293b' : 'white',
                transition: 'color 0.3s ease'
              }}>
                GLG Capital
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: isScrolled ? '#64748b' : 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Financial Group
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: 'none' }} className="lg:flex lg:items-center lg:gap-8">
            <Link 
              href="/" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Home
            </Link>
            
            <Link 
              href="/about" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/about') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              About
            </Link>
            
            <Link 
              href="/investments" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/investments') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Investments
            </Link>
            
            <Link 
              href="/contact" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isActive('/contact') 
                  ? '#d97706' 
                  : isScrolled 
                    ? '#374151' 
                    : 'white',
                textDecoration: 'none'
              }}
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'none' }} className="lg:flex lg:items-center lg:gap-4">
            <Link 
              href="/login" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isScrolled ? '#374151' : 'white',
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              Get Started
            </Link>
            <Link 
              href="/admin/login" 
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: isScrolled ? '#374151' : 'white',
                textDecoration: 'none',
                border: '1px solid',
                borderColor: isScrolled ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem'
              }}
            >
              Admin Console
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'block',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isScrolled ? '#374151' : 'white'
            }}
            className="lg:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div style={{ display: 'block' }} className="lg:hidden">
            <div style={{
              padding: '0.5rem 1rem 0.75rem 1rem',
              marginTop: '0.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              background: isScrolled ? 'white' : 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)'
            }}>
              <Link
                href="/"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  color: isActive('/')
                    ? '#d97706'
                    : isScrolled
                      ? '#374151'
                      : 'white',
                  background: isActive('/') ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '0.25rem'
                }}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              
              <Link
                href="/about"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  color: isActive('/about')
                    ? '#d97706'
                    : isScrolled
                      ? '#374151'
                      : 'white',
                  background: isActive('/about') ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '0.25rem'
                }}
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              
              <Link
                href="/investments"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  color: isActive('/investments')
                    ? '#d97706'
                    : isScrolled
                      ? '#374151'
                      : 'white',
                  background: isActive('/investments') ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '0.25rem'
                }}
                onClick={() => setIsOpen(false)}
              >
                Investments
              </Link>
              
              <Link
                href="/contact"
                style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  color: isActive('/contact')
                    ? '#d97706'
                    : isScrolled
                      ? '#374151'
                      : 'white',
                  background: isActive('/contact') ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  marginBottom: '0.25rem'
                }}
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              <div style={{
                paddingTop: '1rem',
                paddingBottom: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                marginTop: '0.5rem'
              }}>
                <Link
                  href="/login"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    color: isScrolled ? '#374151' : 'white',
                    textDecoration: 'none',
                    marginBottom: '0.5rem'
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    marginTop: '0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  href="/admin/login"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    marginTop: '0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    color: isScrolled ? '#374151' : 'white',
                    textDecoration: 'none',
                    border: '1px solid',
                    borderColor: isScrolled ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)'
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  Admin Console
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 