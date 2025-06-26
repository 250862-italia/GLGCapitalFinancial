"use client"

import Link from "next/link"
import { ArrowLeft, Users, Target, Award, TrendingUp, Building, Globe, Shield } from 'lucide-react'

export default function AboutPage() {
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
            About{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              GLG Capital
            </span>
          </h1>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Founded in 2009, GLG Capital Group LLC has established itself as a premier investment management firm.
          </p>
        </div>

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
            <div className="text-5xl font-bold text-purple-400 mb-2">15+</div>
            <div className="text-white/80">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400 mb-2">98%</div>
            <div className="text-white/80">Client Satisfaction</div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Partner with GLG Capital?</h2>
          <Link
            href="/contact"
            className="inline-block bg-white text-blue-600 px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-colors shadow-2xl"
          >
            Contact Us Today
          </Link>
        </div>
      </div>
    </div>
  )
}
