"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/glg-logo-blue.png"
                alt="GLG Capital Group"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/investments" className="text-slate-600 hover:text-slate-900 font-medium">
                Investments
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 font-medium">
                Contact
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/kyc">
                <Button className="bg-blue-600 hover:bg-blue-700">Start Investing</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              🏆 Trusted by 2,847+ Global Investors
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Professional Investment
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Management
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Access institutional-grade investment opportunities with our expertly managed portfolios. Start your
              wealth-building journey with GLG Capital Group.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kyc">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Start KYC Process
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/investments">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  View Investment Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Packages */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Investment Packages</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our carefully curated investment packages designed for different risk profiles and investment
              goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {investmentPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${
                  hoveredPackage === pkg.id ? "ring-2 ring-blue-500" : ""
                }`}
                onMouseEnter={() => setHoveredPackage(pkg.id)}
                onMouseLeave={() => setHoveredPackage(null)}
              >
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                      <Badge
                        className={`${
                          pkg.riskLevel === "Low"
                            ? "bg-green-100 text-green-800"
                            : pkg.riskLevel === "Medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pkg.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{pkg.expectedROI}%</div>
                      <div className="text-sm text-slate-500">Expected ROI</div>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">{pkg.description}</p>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Min. Investment</span>
                      <span className="font-semibold">${pkg.minInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-semibold">{pkg.duration} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Investors</span>
                      <span className="font-semibold">{pkg.investors}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-sm">
                      <span>Fundraising Progress</span>
                      <span>{Math.round((pkg.totalRaised / pkg.targetAmount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(pkg.totalRaised / pkg.targetAmount) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>${(pkg.totalRaised / 1000000).toFixed(1)}M raised</span>
                      <span>${(pkg.targetAmount / 1000000).toFixed(0)}M target</span>
                    </div>
                  </div>

                  <Link href={`/kyc?package=${pkg.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                      Invest Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/investment-packages">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                View All Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose GLG Capital Group?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We provide institutional-grade investment management with cutting-edge technology and personalized
              service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-slate-600">Trusted by institutional investors and high-net-worth individuals</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 text-xl mb-4">★★★★★</div>
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  "GLG Capital has consistently delivered exceptional returns while maintaining a conservative risk
                  profile. Their expertise in global markets is unmatched."
                </p>
                <div className="font-bold text-slate-900 text-lg">Sarah Johnson</div>
                <div className="text-slate-500">CEO, Johnson Holdings</div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 text-xl mb-4">★★★★★</div>
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  "Professional, transparent, and results-driven. GLG Capital has been instrumental in growing our family
                  office portfolio."
                </p>
                <div className="font-bold text-slate-900 text-lg">Michael Chen</div>
                <div className="text-slate-500">Family Office Director</div>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardContent className="p-0">
                <div className="flex text-yellow-400 text-xl mb-4">★★★★★</div>
                <p className="text-slate-600 mb-6 italic leading-relaxed">
                  "Their sophisticated approach to risk management and personalized service sets them apart from other
                  investment firms."
                </p>
                <div className="font-bold text-slate-900 text-lg">Emma Rodriguez</div>
                <div className="text-slate-500">Private Investor</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Complete our KYC process in minutes and gain access to exclusive investment opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kyc">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-4">
                <Lock className="mr-2 h-5 w-5" />
                Complete KYC Verification
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4"
              >
                Speak with an Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/images/glg-logo-transparent.png"
                alt="GLG Capital Group"
                width={150}
                height={50}
                className="h-10 w-auto mb-4"
              />
              <p className="text-slate-400 leading-relaxed">
                Professional investment management for sophisticated investors worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/investment-packages" className="hover:text-white">
                    Investment Packages
                  </Link>
                </li>
                <li>
                  <Link href="/kyc" className="hover:text-white">
                    KYC Verification
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Portfolio Management
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white">
                    Performance Reports
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/legal" className="hover:text-white">
                    Legal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-slate-400">
                <p>📧 info@glgcapitalgroup.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>🏢 New York, London, Singapore</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 GLG Capital Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
