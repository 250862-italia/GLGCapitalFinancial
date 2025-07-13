import { Suspense } from 'react';
import Link from 'next/link';

// Hero Section Component with enhanced animations
function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-particles"></div>
        <div className="hero-grid"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>Trusted by 500+ Investors Worldwide</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">GLG Capital Group</span>
            <span className="title-accent">LLC</span>
            <span className="hero-subtitle">Strategic Investment Solutions</span>
          </h1>
          
          <p className="hero-description">
            Empowering sophisticated investors with exclusive access to high-growth opportunities, 
            strategic capital management, and personalized wealth solutions for optimal portfolio performance.
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">$2.5B+</div>
              <div className="stat-label">Assets Managed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15.2%</div>
              <div className="stat-label">Avg. Annual Return</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Years Experience</div>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link href="/register" className="btn-primary">
              <span>Start Your Journey</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/about" className="btn-secondary">
              <span>Learn More</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-cards">
            <div className="card card-1">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <h4>Portfolio Growth</h4>
                <p>+15.2% Avg. Return</p>
                <div className="card-progress">
                  <div className="progress-bar" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
            <div className="card card-2">
              <div className="card-icon">💼</div>
              <div className="card-content">
                <h4>Assets Managed</h4>
                <p>$2.5B+ Portfolio</p>
                <div className="card-progress">
                  <div className="progress-bar" style={{width: '92%'}}></div>
                </div>
              </div>
            </div>
            <div className="card card-3">
              <div className="card-icon">🌟</div>
              <div className="card-content">
                <h4>Client Success</h4>
                <p>500+ Investors</p>
                <div className="card-progress">
                  <div className="progress-bar" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>
            <div className="card card-4">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h4>Success Rate</h4>
                <p>98% Satisfaction</p>
                <div className="card-progress">
                  <div className="progress-bar" style={{width: '98%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Services Section
function ServicesSection() {
  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Our Services</div>
          <h2>Comprehensive Investment Solutions</h2>
          <p>Tailored financial strategies designed for sophisticated investors seeking exceptional returns</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🏦</div>
            <div className="service-content">
              <h3>Private Equity</h3>
              <p>Access to exclusive private equity opportunities with high-growth potential companies across diverse sectors.</p>
              <ul>
                <li>Direct investment opportunities</li>
                <li>Venture capital partnerships</li>
                <li>Growth equity strategies</li>
                <li>Buyout transactions</li>
              </ul>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-value">$850M</span>
                  <span className="metric-label">Deployed</span>
                </div>
                <div className="metric">
                  <span className="metric-value">24%</span>
                  <span className="metric-label">Avg. IRR</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">🌍</div>
            <div className="service-content">
              <h3>Global Markets</h3>
              <p>Strategic exposure to international markets with sophisticated risk management and diversification strategies.</p>
              <ul>
                <li>Multi-asset portfolios</li>
                <li>Currency hedging</li>
                <li>Emerging market access</li>
                <li>Quantitative strategies</li>
              </ul>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-value">45+</span>
                  <span className="metric-label">Countries</span>
                </div>
                <div className="metric">
                  <span className="metric-value">12.8%</span>
                  <span className="metric-label">Avg. Return</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">🏢</div>
            <div className="service-content">
              <h3>Real Estate</h3>
              <p>Premium real estate investment opportunities including commercial properties, development projects, and REITs.</p>
              <ul>
                <li>Commercial real estate</li>
                <li>Development financing</li>
                <li>Property management</li>
                <li>REIT investments</li>
              </ul>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-value">$420M</span>
                  <span className="metric-label">Portfolio</span>
                </div>
                <div className="metric">
                  <span className="metric-value">18.5%</span>
                  <span className="metric-label">Avg. Return</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="service-card">
            <div className="service-icon">⚡</div>
            <div className="service-content">
              <h3>Alternative Investments</h3>
              <p>Access to hedge funds, commodities, and other alternative assets for enhanced portfolio diversification.</p>
              <ul>
                <li>Hedge fund strategies</li>
                <li>Commodity trading</li>
                <li>Structured products</li>
                <li>Digital assets</li>
              </ul>
              <div className="service-metrics">
                <div className="metric">
                  <span className="metric-value">$180M</span>
                  <span className="metric-label">AUM</span>
                </div>
                <div className="metric">
                  <span className="metric-value">22.3%</span>
                  <span className="metric-label">Avg. Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Testimonials</div>
          <h2>What Our Clients Say</h2>
          <p>Hear from successful investors who trust GLG Capital Group with their financial future</p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"GLG Capital Group has transformed my investment portfolio. Their strategic approach and exclusive opportunities have delivered exceptional returns year after year."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💼</div>
              <div className="author-info">
                <h4>Michael Rodriguez</h4>
                <span>Portfolio Manager, Tech Ventures</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"The team's expertise in global markets and risk management is unmatched. They've helped me achieve consistent growth while protecting my capital."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍💼</div>
              <div className="author-info">
                <h4>Sarah Chen</h4>
                <span>CEO, Global Enterprises</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <div className="stars">★★★★★</div>
              <p>"Outstanding service and results. GLG Capital Group's private equity opportunities have been game-changing for my investment strategy."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💼</div>
              <div className="author-info">
                <h4>David Thompson</h4>
                <span>Angel Investor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Enhanced Stats Section
function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-number">$2.5B+</div>
            <div className="stat-label">Assets Under Management</div>
            <div className="stat-trend">+12% YoY</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div className="stat-number">15.2%</div>
            <div className="stat-label">Average Annual Return</div>
            <div className="stat-trend">+2.1% vs Market</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-number">500+</div>
            <div className="stat-label">Satisfied Investors</div>
            <div className="stat-trend">98% Retention</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⏰</div>
            <div className="stat-number">25+</div>
            <div className="stat-label">Years of Experience</div>
            <div className="stat-trend">Since 1998</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Enhanced CTA Section
function CTASection() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <div className="cta-badge">Get Started Today</div>
          <h2>Ready to Transform Your Investment Portfolio?</h2>
          <p>Join hundreds of successful investors who trust GLG Capital Group with their financial future. Start your journey towards exceptional returns today.</p>
          
          <div className="cta-features">
            <div className="feature">
              <div className="feature-icon">✅</div>
              <span>No minimum investment</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✅</div>
              <span>Personalized strategy</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✅</div>
              <span>24/7 support</span>
            </div>
          </div>
          
          <div className="cta-buttons">
            <Link href="/register" className="btn-primary-large">
              <span>Create Your Account</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/contact" className="btn-outline-large">
              <span>Speak with an Advisor</span>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Main page content
function HomePageContent() {
  return (
    <div className="homepage">
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-text">GLG</div>
          <div className="logo-subtitle">Capital Group</div>
        </div>
        <div className="loading-spinner"></div>
        <p>Loading your investment future...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
} 