"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, Shield, Users, DollarSign, ArrowRight, Globe, Award, BarChart3, Lock, Zap } from 'lucide-react'

export default function HomePage() {
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null)

  const investmentPackages = [
    {
      id: 1,
      name: "Conservative Growth",
      category: "Low Risk",
      expectedROI: 8.5,
      minInvestment: 10000,
      duration: 12,
      totalRaised: 2500000,
      targetAmount: 5000000,
      investors: 156,
      status: "Active",
      riskLevel: "Low",
      description: "Balanced portfolio focused on capital preservation with moderate growth potential",
    },
    {
      id: 2,
      name: "Aggressive Growth",
      category: "High Risk",
      expectedROI: 18.2,
      minInvestment: 25000,
      duration: 24,
      totalRaised: 8750000,
      targetAmount: 10000000,
      investors: 89,
      status: "Active",
      riskLevel: "High",
      description: "High-growth portfolio focused on emerging markets and innovative technologies",
    },
    {
      id: 3,
      name: "ESG Sustainable",
      category: "ESG",
      expectedROI: 12.8,
      minInvestment: 15000,
      duration: 18,
      totalRaised: 1200000,
      targetAmount: 3000000,
      investors: 67,
      status: "Fundraising",
      riskLevel: "Medium",
      description: "Sustainable investments with ESG criteria and positive environmental impact",
    },
  ]

  const stats = [
    { label: "Assets Under Management", value: "$3.2B", icon: DollarSign },
    { label: "Active Investors", value: "2,847", icon: Users },
    { label: "Average Annual Return", value: "15.4%", icon: TrendingUp },
    { label: "Years of Excellence", value: "12+", icon: Award },
  ]

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your investments are protected with institutional-grade security measures",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your portfolio performance with advanced analytics and reporting",
    },
    {
      icon: Globe,
      title: "Global Diversification",
      description: "Access to international markets and diversified investment opportunities",
    },
    {
      icon: Zap,
      title: "Instant Execution",
      description: "Fast and efficient trade execution with minimal slippage",
    },
  ]

  return (
    <main style={{ maxWidth: 1100, margin: '2rem auto', padding: '2.5rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
      {/* HERO SECTION PRIVATE BANK */}
      <section style={{ textAlign: 'center', marginBottom: '3.5rem', paddingTop: '1.5rem' }}>
        <Image src="/glg-logo.png" alt="GLG Capital Group LLC Logo" width={120} height={120} style={{ margin: '0 auto 1.5rem auto', borderRadius: 16, background: '#fff', boxShadow: '0 2px 12px rgba(34,40,49,0.10)' }} />
        <h1 style={{ color: 'var(--primary)', fontSize: 42, fontWeight: 900, marginBottom: 10, letterSpacing: 1 }}>Private Banking & Wealth Management</h1>
        <h2 style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 600, marginBottom: 18 }}>Tailored financial solutions for discerning clients</h2>
        <a href="/contact" style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--primary)', fontWeight: 700, fontSize: 18, padding: '0.75rem 2.5rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(218,165,32,0.10)', textDecoration: 'none', marginTop: 10 }}>Request a Consultation</a>
      </section>
      {/* SERVIZI PRIVATE BANKING */}
      <section style={{ margin: '0 auto 3rem auto', maxWidth: 950 }}>
        <h3 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 28, textAlign: 'center', marginBottom: 28 }}>Our Private Banking Services</h3>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', minWidth: 220, background: '#f5f6fa', borderRadius: 12, padding: '2rem 1.5rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Wealth Management</h4>
            <p style={{ color: 'var(--foreground)', fontSize: 16 }}>Personalized strategies to grow, protect, and transfer your wealth.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 220, background: '#f5f6fa', borderRadius: 12, padding: '2rem 1.5rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Investment Advisory</h4>
            <p style={{ color: 'var(--foreground)', fontSize: 16 }}>Expert advice and access to exclusive investment opportunities.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 220, background: '#f5f6fa', borderRadius: 12, padding: '2rem 1.5rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Asset Protection</h4>
            <p style={{ color: 'var(--foreground)', fontSize: 16 }}>Comprehensive solutions to safeguard your assets and legacy.</p>
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 220, background: '#f5f6fa', borderRadius: 12, padding: '2rem 1.5rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Succession Planning</h4>
            <p style={{ color: 'var(--foreground)', fontSize: 16 }}>Tailored plans to ensure a smooth transition for future generations.</p>
          </div>
        </div>
      </section>
      {/* VALORI PRIVATE BANK */}
      <section style={{ margin: '0 auto 3rem auto', maxWidth: 900 }}>
        <h3 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 28, textAlign: 'center', marginBottom: 24 }}>Why GLG Private Bank</h3>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px', minWidth: 180, background: '#fff', border: '2px solid var(--accent)', borderRadius: 10, padding: '1.5rem 1rem', textAlign: 'center' }}>
            <h5 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Discretion</h5>
            <p style={{ color: 'var(--foreground)', fontSize: 15 }}>Your privacy is our top priority in every relationship.</p>
          </div>
          <div style={{ flex: '1 1 180px', minWidth: 180, background: '#fff', border: '2px solid var(--accent)', borderRadius: 10, padding: '1.5rem 1rem', textAlign: 'center' }}>
            <h5 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Trust</h5>
            <p style={{ color: 'var(--foreground)', fontSize: 15 }}>A legacy of reliability and long-term client relationships.</p>
          </div>
          <div style={{ flex: '1 1 180px', minWidth: 180, background: '#fff', border: '2px solid var(--accent)', borderRadius: 10, padding: '1.5rem 1rem', textAlign: 'center' }}>
            <h5 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Excellence</h5>
            <p style={{ color: 'var(--foreground)', fontSize: 15 }}>Uncompromising standards in service and performance.</p>
          </div>
          <div style={{ flex: '1 1 180px', minWidth: 180, background: '#fff', border: '2px solid var(--accent)', borderRadius: 10, padding: '1.5rem 1rem', textAlign: 'center' }}>
            <h5 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Personalization</h5>
            <p style={{ color: 'var(--foreground)', fontSize: 15 }}>Bespoke solutions for every client's unique needs.</p>
          </div>
        </div>
      </section>
      {/* CONTATTI IN EVIDENZA */}
      <section style={{ background: 'var(--secondary)', borderRadius: 10, padding: '2rem 1rem', margin: '0 auto 2.5rem auto', maxWidth: 600, boxShadow: '0 2px 12px rgba(10,37,64,0.06)', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Contact Your Private Banker</h4>
        <div style={{ color: 'var(--foreground)', fontSize: 17, marginBottom: 6 }}>
          <b>GLG Capital Consulting LLC</b><br />1309 Coffeen Avenue, STE 1200, Sheridan – WY 82801
        </div>
        <div style={{ color: 'var(--foreground)', fontSize: 16, marginBottom: 6 }}>
          <b>Email:</b> <a href="mailto:corefound@glgcapitalgroupllc.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>corefound@glgcapitalgroupllc.com</a>
        </div>
        <div style={{ color: 'var(--foreground)', fontSize: 16, marginBottom: 12 }}>
          <b>Phone:</b> <a href="tel:+13072630876" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>+1 307 2630876</a>
        </div>
        <a href="/contact" style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--primary)', fontWeight: 700, fontSize: 17, padding: '0.6rem 2rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(218,165,32,0.10)', textDecoration: 'none', marginTop: 8 }}>Contact Us</a>
      </section>
    </main>
  )
}
