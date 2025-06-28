"use client"
import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Clock, ExternalLink } from "lucide-react"

interface FinancialNews {
  id: number;
  title: string;
  summary: string;
  impact: 'positive' | 'negative' | 'neutral';
  source: string;
  timestamp: string;
  category: string;
  url?: string;
}

const initialNews: FinancialNews[] = [
  {
    id: 1,
    title: "GLG Capital Group Announces Strategic Partnership with MD Financial Services",
    summary: "Major breakthrough in institutional investment services with guaranteed returns framework",
    impact: 'positive',
    source: "Financial Times",
    timestamp: "2 hours ago",
    category: "Partnership"
  },
  {
    id: 2,
    title: "Global Markets Show Strong Recovery Amid Economic Stability",
    summary: "Major indices reach new highs as investor confidence strengthens",
    impact: 'positive',
    source: "Bloomberg",
    timestamp: "4 hours ago",
    category: "Markets"
  },
  {
    id: 3,
    title: "Federal Reserve Signals Potential Rate Adjustments",
    summary: "Central bank considers monetary policy changes in response to inflation data",
    impact: 'neutral',
    source: "Reuters",
    timestamp: "6 hours ago",
    category: "Policy"
  },
  {
    id: 4,
    title: "Tech Sector Leads Market Gains with 3.2% Increase",
    summary: "Technology stocks outperform as earnings season exceeds expectations",
    impact: 'positive',
    source: "CNBC",
    timestamp: "8 hours ago",
    category: "Technology"
  }
];

const newsTemplates = [
  {
    title: "GLG-MD Partnership Delivers 15% Portfolio Growth",
    summary: "Strategic collaboration exceeds initial performance targets",
    impact: 'positive' as const,
    source: "GLG Internal",
    category: "Performance"
  },
  {
    title: "European Markets Rally on Strong Economic Data",
    summary: "Eurozone indices climb as inflation concerns ease",
    impact: 'positive' as const,
    source: "Financial Times",
    category: "Markets"
  },
  {
    title: "Oil Prices Stabilize After OPEC+ Meeting",
    summary: "Energy markets find balance as production cuts take effect",
    impact: 'neutral' as const,
    source: "Reuters",
    category: "Commodities"
  },
  {
    title: "Asian Markets Show Mixed Performance",
    summary: "Regional indices respond to varying economic indicators",
    impact: 'neutral' as const,
    source: "Bloomberg",
    category: "Markets"
  },
  {
    title: "Cryptocurrency Markets Experience Volatility",
    summary: "Digital assets fluctuate amid regulatory developments",
    impact: 'negative' as const,
    source: "CoinDesk",
    category: "Crypto"
  },
  {
    title: "Real Estate Investment Trusts Gain Momentum",
    summary: "REITs outperform as commercial property markets recover",
    impact: 'positive' as const,
    source: "CNBC",
    category: "Real Estate"
  }
];

export default function FinancialNews() {
  const [news, setNews] = useState<FinancialNews[]>(initialNews);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <TrendingUp size={16} style={{ color: '#059669' }} />;
      case 'negative':
        return <TrendingDown size={16} style={{ color: '#dc2626' }} />;
      default:
        return <TrendingUp size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    if (minutes < 10) {
      return `${hours}:0${minutes}`;
    }
    return `${hours}:${minutes}`;
  };

  const updateNews = () => {
    const randomTemplate = newsTemplates[Math.floor(Math.random() * newsTemplates.length)];
    const newNews = {
      id: Date.now(),
      title: randomTemplate.title,
      summary: randomTemplate.summary,
      impact: randomTemplate.impact,
      source: randomTemplate.source,
      timestamp: "Just updated",
      category: randomTemplate.category
    };

    setNews(prevNews => [newNews, ...prevNews.slice(0, 3)]);
    setLastUpdate(getTimeAgo());
  };

  useEffect(() => {
    // Update news every 6 hours (21600000 ms) for demo purposes
    // In production, this would be much longer (24 hours = 86400000 ms)
    const interval = setInterval(updateNews, 21600000);
    
    // Also update on component mount
    updateNews();
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#111827'
        }}>
          Live Financial News
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <Clock size={16} />
          <span>Last update: {lastUpdate}</span>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {news.map((item) => (
          <div key={item.id} style={{
            background: '#f9fafb',
            borderRadius: 8,
            padding: '1rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#f9fafb';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#2563eb',
                background: '#dbeafe',
                padding: '0.25rem 0.5rem',
                borderRadius: 4
              }}>
                {item.category}
              </span>
              {getImpactIcon(item.impact)}
            </div>
            <h3 style={{
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              lineHeight: 1.4
            }}>
              {item.title}
            </h3>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginBottom: '0.75rem',
              lineHeight: 1.4
            }}>
              {item.summary}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              <span>{item.source}</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          News updates automatically every 6 hours. Partnership news updates daily.
        </p>
      </div>
    </div>
  );
} 