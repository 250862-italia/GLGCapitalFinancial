import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">← Back to Home</Link>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6">About GLG Capital Group LLC</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-lg text-gray-600 mb-4">
            Founded in 2009, GLG Capital Group LLC has established itself as a premier investment management firm, 
            serving institutional clients and high-net-worth individuals worldwide.
          </p>
          <p className="text-lg text-gray-600">
            Over the past 15 years, we have grown to manage over €2.5 billion in assets for more than 500 clients globally.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Partner with GLG Capital?</h2>
          <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
