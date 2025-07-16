import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">GLG Capital Group LLC</div>
                <div className="text-sm text-gray-300">Financial Services</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Professional financial services and investment solutions. 
              Specializing in equity pledge systems and corporate financing.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📧</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📱</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💼</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/equity-pledge" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Equity Pledge System
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Corporate Financing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Investment Advisory
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Financial Planning
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gray-300 hover:text-amber-400 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-gray-300 text-sm">GLG Capital Group LLC</p>
                  <p className="text-gray-400 text-xs">Financial Services Company</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-gray-300 text-sm">Email: info@glgcapitalgroupllc.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <p className="text-gray-300 text-sm">Professional Financial Services</p>
                  <p className="text-gray-400 text-xs">Investment & Advisory</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 GLG Capital Group LLC. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                Legal Notice
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 