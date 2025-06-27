"use client"
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function StockTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simulated stock data - in a real app this would come from an API
  const stocks: StockData[] = [
    { symbol: "AAPL", name: "Apple Inc.", price: 198.45, change: 2.34, changePercent: 1.19 },
    { symbol: "MSFT", name: "Microsoft", price: 415.67, change: -1.23, changePercent: -0.30 },
    { symbol: "GOOGL", name: "Alphabet", price: 142.89, change: 3.45, changePercent: 2.47 },
    { symbol: "AMZN", name: "Amazon", price: 178.23, change: 1.67, changePercent: 0.95 },
    { symbol: "TSLA", name: "Tesla", price: 245.78, change: -5.67, changePercent: -2.25 },
    { symbol: "NVDA", name: "NVIDIA", price: 892.34, change: 12.45, changePercent: 1.41 },
    { symbol: "META", name: "Meta", price: 456.78, change: 8.90, changePercent: 1.99 },
    { symbol: "NFLX", name: "Netflix", price: 678.90, change: -3.21, changePercent: -0.47 }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stocks.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [stocks.length])

  const currentStock = stocks[currentIndex]
  const isPositive = currentStock.change >= 0

  return (
    <div style={{
      background: 'var(--primary)',
      color: '#fff',
      padding: '0.75rem 0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        animation: 'slideIn 0.5s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>LIVE MARKETS:</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{currentStock.symbol}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>{currentStock.name}</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>${currentStock.price.toFixed(2)}</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            color: isPositive ? '#10b981' : '#ef4444',
            fontWeight: 600,
            fontSize: 14
          }}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{currentStock.change.toFixed(2)} ({isPositive ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
          </div>
        </div>

        <div style={{ 
          width: '8px', 
          height: '8px', 
          background: '#10b981', 
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
} 