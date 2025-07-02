"use client";

import { CheckCircle, Shield, TrendingUp, FileText, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EquityPledgePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1rem", background: "var(--background)", borderRadius: 16 }}>
      <h1 style={{ color: "var(--primary)", fontSize: 38, fontWeight: 900, marginBottom: 18, textAlign: "center", letterSpacing: -1 }}>
        Equity-Pledge Business Model by GLG Capital Group LLC
      </h1>
      <p style={{ color: "var(--foreground)", fontSize: 22, lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}>
        An innovative, secure approach to fuel corporate growth by combining fixed returns with real collateral.
      </p>

      {/* 1. Vision & Goal */}
      <SectionBlock icon={<TrendingUp color="var(--accent)" size={32} />} title="1. Vision & Goal" bg="white">
        <p>
          Imagine your business expanding without being bound by traditional lending constraints.<br /><br />
          With our Equity-Pledge system, you transform your own shares into strategic financing power: unlock capital on favorable terms while retaining full control.
        </p>
        <Quote>
          “Every decision you make today shapes your tomorrow. Choose a path of precision and security: pledge your equity, secure your future.”
        </Quote>
      </SectionBlock>

      {/* 2. Legal Vehicle Structure */}
      <SectionBlock icon={<Shield color="var(--accent)" size={32} />} title="2. Legal Vehicle Structure" bg="gray">
        <p>
          A dedicated branch or subsidiary (e.g., “MyCompany Italy Branch”) is established, empowered to issue investor-specific shares.
        </p>
        <ul>
          <li>Creation of tailored share classes</li>
          <li>Transfer restrictions to ensure stability</li>
          <li>Clear, binding pledge provisions</li>
        </ul>
      </SectionBlock>

      {/* 3. Subscription & Onboarding */}
      <SectionBlock icon={<FileText color="var(--accent)" size={32} />} title="3. Subscription & Onboarding" bg="white">
        <ol>
          <li>Investors fill out the online form and digitally sign the Subscription Agreement.</li>
          <li>Funds are transferred into a segregated escrow account, guaranteeing security.</li>
          <li>Our system instantly confirms receipt and formalizes the share pledge.</li>
        </ol>
        <Quote>
          “With each click, you take control of your financial destiny: clarity empowers confidence.”
        </Quote>
      </SectionBlock>

      {/* 4. Collateral & Pledge */}
      <SectionBlock icon={<CheckCircle color="var(--accent)" size={32} />} title="4. Collateral & Pledge" bg="gray">
        <p>
          Upon funding, the newly issued shares are formally pledged as collateral.<br /><br />
          Enforcement is documented via:
        </p>
        <ul>
          <li>Official register entry</li>
          <li>Digital records accessible anytime</li>
        </ul>
        <p>
          In case of non-repayment, pledge enforcement is automated: shares are liquidated to satisfy the debt.
        </p>
      </SectionBlock>

      {/* 5. Fixed Returns & Security */}
      <SectionBlock icon={<TrendingUp color="var(--accent)" size={32} />} title="5. Fixed Returns & Security" bg="white" highlight>
        <ul>
          <li>Enjoy a predictable and attractive return profile, designed to outperform traditional financing.</li>
          <li>Benefit from true security: your investment is backed by a real equity pledge.</li>
          <li>Experience hassle‑free financing: automatic principal and earnings release at the end of the agreed term.</li>
        </ul>
      </SectionBlock>

      {/* 6. Transparent Reporting */}
      <SectionBlock icon={<Users color="var(--accent)" size={32} />} title="6. Transparent Reporting" bg="gray">
        <ul>
          <li>Quarterly reports include:</li>
          <ul style={{ marginLeft: 24 }}>
            <li>Invested principal</li>
            <li>Accrued interest</li>
            <li>Pledge status</li>
          </ul>
          <li>24/7 access to a dedicated dashboard: complete transparency, zero surprises.</li>
        </ul>
      </SectionBlock>

      {/* 7. Early Exit Option */}
      <SectionBlock icon={<ArrowRight color="var(--accent)" size={32} />} title="7. Early Exit Option" bg="white">
        <ul>
          <li>Should an investor choose to exit early:</li>
          <ul style={{ marginLeft: 24 }}>
            <li>Predefined early redemption terms apply</li>
            <li>Conditions detailed in the Term Sheet and Agreement</li>
          </ul>
        </ul>
        <Quote>
          “Maintain your power to choose: exit when it serves your strategy.”
        </Quote>
      </SectionBlock>

      {/* 8. Key Benefits */}
      <SectionBlock icon={<CheckCircle color="var(--accent)" size={32} />} title="8. Key Benefits" bg="gray">
        <ul>
          <li>Predictable returns higher than many traditional options</li>
          <li>Real capital protection via equity pledge</li>
          <li>Streamlined digital process: fast, secure, and paperless</li>
          <li>Flexible terms: customizable and scalable for your needs</li>
        </ul>
      </SectionBlock>

      {/* 9. Ready to Secure Your Tomorrow? */}
      <section style={{
        background: 'var(--primary)',
        color: 'var(--secondary)',
        borderRadius: 18,
        padding: '2.5rem 2rem',
        margin: '40px 0 0 0',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(10,37,64,0.10)',
        border: '1px solid var(--border)'
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, color: 'var(--secondary)' }}>9. Ready to Secure Your Tomorrow?</h2>
        <p style={{ fontSize: 20, color: 'var(--secondary)', marginBottom: 24 }}>
          Discover how GLG Capital Group LLC's Equity-Pledge model can elevate your enterprise.<br />
          <b>Contact our team for a free, personalized consultation and forge the path to lasting success.</b>
        </p>
        <Link href="/contact" style={{
          display: 'inline-block',
          background: 'var(--accent)',
          color: 'var(--primary)',
          padding: '1rem 2.5rem',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 22,
          boxShadow: '0 2px 8px rgba(245,158,11,0.15)',
          transition: 'all 0.3s',
        }}>
          Request Your Free Consultation
        </Link>
      </section>
    </main>
  );
}

function SectionBlock({ icon, title, children, highlight, bg }: { icon: React.ReactNode, title: string, children: React.ReactNode, highlight?: boolean, bg?: 'white' | 'gray' }) {
  return (
    <section style={{
      background: bg === 'gray' ? 'var(--secondary)' : '#fff',
      borderRadius: 16,
      padding: '2rem 1.5rem',
      marginBottom: 28,
      boxShadow: '0 2px 8px rgba(10,37,64,0.06)',
      border: '1px solid var(--border)',
      display: 'flex',
      gap: 24,
      alignItems: 'flex-start',
      fontSize: 18
    }}>
      <div style={{ minWidth: 40, marginTop: 4 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h2 style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
        <div style={{ color: 'var(--foreground)', fontSize: 17 }}>{children}</div>
      </div>
    </section>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote style={{
      color: 'var(--accent)',
      fontSize: 18,
      fontStyle: 'italic',
      margin: '18px 0 0 0',
      paddingLeft: 16,
      borderLeft: '4px solid var(--accent)',
      background: 'var(--secondary)',
      borderRadius: 8
    }}>{children}</blockquote>
  );
}
