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
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Live Financial News</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Last update: {lastUpdate}</span>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {item.category}
              </span>
              {getImpactIcon(item.impact)}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {item.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.source}</span>
              <span>{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          News updates automatically every 6 hours. Partnership news updates daily.
        </p>
      </div>
    </div>
  );
} 