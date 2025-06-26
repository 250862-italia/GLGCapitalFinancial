"use client"

import Link from "next/link"
import { ArrowLeft, Users, Target, Award, TrendingUp, Building, Globe, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-2xl font-bold text-white">GLG Capital Group LLC</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              GLG Capital
            </span>
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Founded in 2009, GLG Capital Group LLC has established itself as a premier investment management firm,
            serving institutional clients and high-net-worth individuals worldwide.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-400 mb-2">€2.5B+</div>
            <div className="text-white/80">Assets Under Management</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-2">500+</div>
            <div className="text-white/80">Global Clients</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-400 mb-2">15+
cat > app/contact/page.tsx << 'EOF'
"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send, Building, Globe, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-2xl font-bold text-white">GLG Capital Group LLC</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              GLG Capital
            </span>
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Ready to discuss your investment goals? Our team of experts is here to help you navigate your financial future.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8">Get in Touch</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-3">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm" 
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm" 
                    placeholder="john@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Company</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm" 
                  placeholder="Your Company"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Investment Amount</label>
                <select className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm">
                  <option value="" className="bg-slate-800">Select range</option>
                  <option value="100k-500k" className="bg-slate-800">€100K - €500K</option>
                  <option value="500k-1m" className="bg-slate-800">€500K - €1M</option>
                  <option value="1m-5m" className="bg-slate-800">€1M - €5M</option>
                  <option value="5m+" className="bg-slate-800">€5M+</option>
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-3">Message</label>
                <textarea 
                  rows={5} 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm" 
                  placeholder="Tell us about your investment goals..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-2xl"
              >
                <Send className="h-6 w-6" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8">Quick Contact</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Phone className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-xl font-semibold text-white">+1 (212) 555-0123</p>
                    <p className="text-white/60">Main Office</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-xl font-semibold text-white">info@glgcapital.com</p>
                    <p className="text-white/60">General Inquiries</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-xl font-semibold text-white">Mon - Fri: 9:00 - 18:00</p>
                    <p className="text-white/60">EST Business Hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-10 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8">Global Offices</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-8 w-8 text-blue-400 mt-1" />
                    <div>
                      <p className="text-xl font-semibold text-white">New York (HQ)</p>
                      <p className="text-white/80">123 Wall Street<br/>New York, NY 10005</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-8 w-8 text-green-400 mt-1" />
                    <div>
                      <p className="text-xl font-semibold text-white">London</p>
                      <p className="text-white/80">25 Bank Street<br/>London E14 5JP, UK</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-8 w-8 text-purple-400 mt-1" />
                    <div>
                      <p className="text-xl font-semibold text-white">Singapore</p>
                      <p className="text-white/80">1 Raffles Place<br/>Singapore 048616</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16">
          <h2 className="text-5xl font-bold text-white mb-6">Schedule a Consultation</h2>
          <p className="text-2
eof
