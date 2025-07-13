import { Suspense } from 'react';
import Link from 'next/link';

// Hero Section Component
function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            GLG Capital Group LLC
            <span className="hero-subtitle">Strategic Investment Solutions</span>
          </h1>
          <p className="hero-description">
            Empowering investors with innovative financial solutions, strategic capital management, 
            and exclusive investment opportunities for optimal portfolio growth.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="btn-primary">
              Start Investing
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn More
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
              </div>
            </div>
            <div className="card card-2">
              <div className="card-icon">💼</div>
              <div className="card-content">
                <h4>Assets Managed</h4>
                <p>$2.5B+ Portfolio</p>
              </div>
            </div>
            <div className="card card-3">
              <div className="card-icon">🌟</div>
              <div className="card-content">
                <h4>Client Success</h4>
                <p>500+ Investors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Services Section Component
function ServicesSection() {
  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Investment Solutions</h2>
          <p>Comprehensive financial services designed for sophisticated investors</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🏦</div>
            <h3>Private Equity</h3>
            <p>Access to exclusive private equity opportunities with high-growth potential companies across diverse sectors.</p>
            <ul>
              <li>Direct investment opportunities</li>
              <li>Venture capital partnerships</li>
              <li>Growth equity strategies</li>
            </ul>
          </div>
          
          <div className="service-card">
            <div className="service-icon">🌍</div>
            <h3>Global Markets</h3>
            <p>Strategic exposure to international markets with sophisticated risk management and diversification strategies.</p>
            <ul>
              <li>Multi-asset portfolios</li>
              <li>Currency hedging</li>
              <li>Emerging market access</li>
            </ul>
          </div>
          
          <div className="service-card">
            <div className="service-icon">🏢</div>
            <h3>Real Estate</h3>
            <p>Premium real estate investment opportunities including commercial properties, development projects, and REITs.</p>
            <ul>
              <li>Commercial real estate</li>
              <li>Development financing</li>
              <li>Property management</li>
            </ul>
          </div>
          
          <div className="service-card">
            <div className="service-icon">⚡</div>
            <h3>Alternative Investments</h3>
            <p>Access to hedge funds, commodities, and other alternative assets for enhanced portfolio diversification.</p>
            <ul>
              <li>Hedge fund strategies</li>
              <li>Commodity trading</li>
              <li>Structured products</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Section Component
function StatsSection() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">$2.5B+</div>
            <div className="stat-label">Assets Under Management</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">15.2%</div>
            <div className="stat-label">Average Annual Return</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Satisfied Investors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">25+</div>
            <div className="stat-label">Years of Experience</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2>Ready to Start Your Investment Journey?</h2>
          <p>Join hundreds of successful investors who trust GLG Capital Group with their financial future.</p>
          <div className="cta-buttons">
            <Link href="/register" className="btn-primary-large">
              Create Your Account
            </Link>
            <Link href="/contact" className="btn-outline-large">
              Speak with an Advisor
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
        <div className="loading-spinner"></div>
        <p>Loading GLG Capital Group...</p>
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