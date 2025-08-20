"use client";

import Link from 'next/link';
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Building2, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart,
  Lock
} from 'lucide-react';

export default function EquityPledgePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Equity Pledge System
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              <strong>Innovative financing model</strong> with fixed returns secured by company shares, 
              providing stability and growth potential for both investors and businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
              >
                Start Investing Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/about"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Equity Pledge Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our revolutionary financing model combines the security of equity with the predictability of fixed returns.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Company Assessment</h3>
              <p className="text-gray-600">
                We evaluate your business potential, market position, and growth trajectory to determine 
                the optimal financing structure and terms.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Equity Pledge Agreement</h3>
              <p className="text-gray-600">
                We create a structured agreement where company shares serve as security, ensuring 
                investor protection while maintaining business control.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Growth & Returns</h3>
              <p className="text-gray-600">
                Your business receives the capital needed for expansion while investors enjoy 
                predictable returns secured by tangible equity value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Benefits of Equity Pledge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover why leading enterprises choose our innovative financing solution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fixed Returns</h3>
              <p className="text-gray-600">
                Predictable, guaranteed returns that provide stability and peace of mind for investors.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Security</h3>
              <p className="text-gray-600">
                Company shares serve as collateral, ensuring investor protection and risk mitigation.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Control</h3>
              <p className="text-gray-600">
                Maintain full operational control while accessing the capital needed for growth and expansion.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Growth Capital</h3>
              <p className="text-gray-600">
                Access substantial funding for expansion, innovation, and market penetration strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Structure */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Investment Structure & Terms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible investment options designed to meet diverse investor needs and business requirements.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Periods</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Short-term</span>
                  <span className="font-semibold text-blue-600">6-12 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Medium-term</span>
                  <span className="font-semibold text-blue-600">1-3 years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Long-term</span>
                  <span className="font-semibold text-blue-600">3-5 years</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Flexible terms tailored to your investment goals and timeline preferences.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <PieChart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Return Rates</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Conservative</span>
                  <span className="font-semibold text-purple-600">8-12% annually</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Balanced</span>
                  <span className="font-semibold text-purple-600">12-18% annually</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Growth</span>
                  <span className="font-semibold text-purple-600">18-25% annually</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Competitive returns based on risk profile and market conditions.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Security Features</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Share collateral</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Legal protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Insurance coverage</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Multiple layers of protection ensuring your investment security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real results from enterprises that have leveraged our Equity Pledge System.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Tech Startup</h4>
                  <p className="text-sm text-gray-500">Software Development</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "GLG Capital's Equity Pledge System provided us with $2M in growth capital, 
                enabling us to expand our development team and launch new products."
              </p>
              <div className="text-sm text-gray-500">
                <p>• Investment: $2,000,000</p>
                <p>• Return: 18% annually</p>
                <p>• Growth: 300% revenue increase</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Manufacturing Co.</h4>
                  <p className="text-sm text-gray-500">Industrial Manufacturing</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The flexible terms and competitive rates allowed us to modernize our facilities 
                and increase production capacity by 150%."
              </p>
              <div className="text-sm text-gray-500">
                <p>• Investment: $5,000,000</p>
                <p>• Return: 15% annually</p>
                <p>• Growth: 150% capacity increase</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Healthcare Provider</h4>
                  <p className="text-sm text-gray-500">Medical Services</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "GLG Capital helped us expand our network of clinics and invest in cutting-edge 
                medical technology, improving patient care quality."
              </p>
              <div className="text-sm text-gray-500">
                <p>• Investment: $3,500,000</p>
                <p>• Return: 12% annually</p>
                <p>• Growth: 200% patient capacity</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of successful investors who trust GLG Capital for their financial growth and stability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
            >
              Get Started Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/about"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
