"use client"

import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
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
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              GLG Capital
            </span>
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Ready to discuss your investment goals? Our team of experts is here to help.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8">Get in Touch</h2>
            <div className="space-y-8">
              <div className="flex items-center justify-center space-x-4">
                <Phone className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-xl font-semibold text-white">+1 (212) 555-0123</p>
                  <p className="text-white/60">Main Office</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <Mail className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-xl font-semibold text-white">info@glgcapital.com</p>
                  <p className="text-white/60">General Inquiries</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <Clock className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-xl font-semibold text-white">Mon - Fri: 9:00 - 18:00</p>
                  <p className="text-white/60">EST Business Hours</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <MapPin className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-xl font-semibold text-white">New York, London, Singapore</p>
                  <p className="text-white/60">Global Offices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
