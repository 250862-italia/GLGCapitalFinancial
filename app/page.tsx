import Link from 'next/link';
import { 
  TrendingUp, 
  Globe, 
  Shield, 
  Award, 
  ArrowRight, 
  Building2,
  Users,
  BarChart3,
  Target,
  Zap,
  Menu,
  X
} from 'lucide-react';
import GLGLogo from '@/components/GLGLogo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <GLGLogo size="sm" showText={false} />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">GLG Capital Group</h1>
                <p className="text-sm text-gray-600">Financial Services</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
              <Link href="/equity-pledge" className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                Equity Pledge
              </Link>
              <Link href="/admin/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-900 hover:text-blue-600">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <GLGLogo size="lg" showText={false} />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                GLG Capital Group
              </h1>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Premium Investment Solutions</h2>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed">
              <strong>Empower your vision.</strong> Through our premium share-pledge framework, trailblazing enterprises harness strategic capital to dominate tomorrow's markets—fueling exponential growth, unshakable resilience, and enduring legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/equity-pledge" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2">
                Start Investing Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/about" className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">$500M+</div>
              <div className="text-gray-600 font-medium">Assets Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Global Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose GLG Capital?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Strategic capital solutions driving exponential growth and resilience for forward-thinking enterprises.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Equity Pledge System</h3>
              <p className="text-gray-600">Innovative financing model with fixed returns secured by company shares, providing stability and growth potential.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600">US-based financial services company with international expertise and a network spanning multiple continents.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Proven Results</h3>
              <p className="text-gray-600">Strategic capital solutions driving exponential growth and resilience for forward-thinking enterprises.</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Compliant</h3>
              <p className="text-gray-600">Full regulatory compliance with robust security measures protecting your investments and data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comprehensive financial solutions designed for modern enterprises and investors.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Equity Pledge System</h3>
              <p className="text-gray-600 mb-6">Our innovative financing model provides fixed returns secured by company shares, offering both stability and growth potential for investors and businesses.</p>
              <Link href="/equity-pledge" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Corporate Financing</h3>
              <p className="text-gray-600 mb-6">Strategic capital solutions tailored for enterprises seeking growth, expansion, or operational optimization with flexible terms and competitive rates.</p>
              <Link href="/about" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Advisory</h3>
              <p className="text-gray-600 mb-6">Expert guidance from seasoned financial professionals helping you make informed investment decisions aligned with your long-term financial goals.</p>
              <Link href="/about" className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">Join hundreds of successful investors who trust GLG Capital for their financial growth and stability.</p>
          <Link href="/equity-pledge" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2">
            Get Started Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <GLGLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-lg font-bold">GLG Capital Group LLC</h3>
                  <p className="text-sm text-gray-400">Financial Services</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Professional financial services and investment solutions. Specializing in equity pledge systems and corporate financing.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Our Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>• Equity Pledge System</li>
                <li>• Corporate Financing</li>
                <li>• Investment Advisory</li>
                <li>• Financial Planning</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/equity-pledge" className="text-gray-400 hover:text-white transition-colors">Equity Pledge</Link></li>
                <li><Link href="/admin/login" className="text-gray-400 hover:text-white transition-colors">Admin Console</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-gray-400">
                <p>GLG Capital Group LLC</p>
                <p>Financial Services Company</p>
                <p>Email: info@glgcapitalgroupllc.com</p>
                <p>Professional Financial Services</p>
                <p>Investment & Advisory</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2024 GLG Capital Group LLC. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/legal" className="hover:text-white transition-colors">Legal Notice</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 