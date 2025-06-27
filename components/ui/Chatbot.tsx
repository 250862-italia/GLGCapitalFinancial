"use client";
import { useState } from "react";

const faqs = [
  { 
    q: "What services does GLG Capital Group offer?", 
    a: "GLG Capital Group offers professional position management services with guaranteed returns. We provide investment packages with daily compound interest, comprehensive KYC verification, secure payment processing, and 24/7 portfolio monitoring through our dashboard." 
  },
  { 
    q: "How do I register and start investing?", 
    a: "Click 'Register' on our homepage to start. The process includes: 1) Personal information, 2) KYC document verification, 3) Package selection, 4) Payment processing. Once approved, you'll access your portfolio dashboard." 
  },
  { 
    q: "What investment packages are available?", 
    a: "We offer multiple packages: Starter ($1,000-5,000), Professional ($5,000-25,000), Premium ($25,000-100,000), and Elite ($100,000+). Each package offers daily compound interest with returns ranging from 0.5% to 2% daily, depending on the package size." 
  },
  { 
    q: "How does the daily earnings calculation work?", 
    a: "Daily earnings use compound interest: Daily = Principal × (1 + Daily Rate)^Days - Principal. For example, $10,000 at 1% daily = $10,000 × (1.01)^1 - $10,000 = $100. Earnings compound daily for exponential growth." 
  },
  { 
    q: "What documents are required for KYC?", 
    a: "Required documents: Government ID (passport/driver's license), proof of address (utility bill/bank statement), proof of income (payslip/tax return), bank statements (last 3 months), and source of funds declaration. All documents must be clear and recent." 
  },
  { 
    q: "How long does KYC approval take?", 
    a: "KYC approval typically takes 24-48 hours after document submission. Our compliance team reviews all documents for authenticity and completeness. You'll receive email notification once approved or if additional documents are needed." 
  },
  { 
    q: "What payment methods are accepted?", 
    a: "We accept: Credit/Debit cards (Visa, Mastercard), PayPal, and bank transfers (IBAN). All payments are processed securely through our encrypted payment gateway. Minimum investment varies by package." 
  },
  { 
    q: "How can I view my portfolio and returns?", 
    a: "After registration and KYC approval, access your portfolio dashboard at /reserved. View real-time positions, daily/monthly/yearly returns, growth charts, and transaction history. The dashboard updates automatically with live market data." 
  },
  { 
    q: "Is my investment secure?", 
    a: "Yes, all investments are secured through our professional risk management system. We use bank-grade encryption, secure payment processing, and maintain strict compliance with financial regulations. Your funds are protected by our comprehensive security protocols." 
  },
  { 
    q: "Can I withdraw my earnings?", 
    a: "Earnings are automatically reinvested for compound growth. Withdrawal options are available after the initial lock-in period (varies by package). Contact our support team for withdrawal requests and processing times." 
  },
  { 
    q: "What currencies are supported?", 
    a: "We support multiple currencies: USD, EUR, GBP, CHF, and JPY. You can select your preferred currency during registration. All calculations and returns are displayed in your chosen currency." 
  },
  { 
    q: "How do I contact support?", 
    a: "Use this chat, email us at corefound@glgcapitalgroupllc.com, or call our support line. Our team is available 24/7 to assist with registration, KYC, payments, portfolio questions, and technical support." 
  },
  { 
    q: "What is the minimum investment?", 
    a: "Minimum investment starts at $1,000 for our Starter package. Higher packages offer better daily returns and additional benefits. Choose the package that best fits your investment goals and budget." 
  },
  { 
    q: "How often are returns calculated?", 
    a: "Returns are calculated daily using compound interest. Your portfolio value updates every 24 hours, showing your growth. You can view daily, monthly, and yearly projections in your dashboard." 
  },
  { 
    q: "What happens if I need to cancel my investment?", 
    a: "Investment cancellation is available for superadmin accounts only. Standard accounts have lock-in periods based on package type. Contact support for specific cancellation policies and any applicable fees." 
  }
];

const quickActions = [
  { label: "View Packages", action: "packages" },
  { label: "Start Registration", action: "register" },
  { label: "KYC Process", action: "kyc" },
  { label: "Payment Methods", action: "payments" },
  { label: "Portfolio Access", action: "portfolio" },
  { label: "Contact Support", action: "support" }
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 2500);
  };

  const handleQuickAction = (action: string) => {
    switch(action) {
      case "packages":
        window.location.href = "/iscriviti";
        break;
      case "register":
        window.location.href = "/iscriviti";
        break;
      case "kyc":
        setSelectedFaq(4); // KYC FAQ
        break;
      case "payments":
        setSelectedFaq(6); // Payment methods FAQ
        break;
      case "portfolio":
        window.location.href = "/reserved";
        break;
      case "support":
        setSelectedFaq(11); // Contact support FAQ
        break;
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Chat icon */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: "var(--accent)",
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          boxShadow: "0 2px 8px rgba(218,165,32,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        aria-label="Open GLG Capital Group chatbot"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="12" fill="#FFD700"/>
          <path d="M7 10h10M7 14h6" stroke="#1A2238" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 110,
            right: 32,
            width: 380,
            maxHeight: "70vh",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(10,37,64,0.18)",
            zIndex: 1001,
            padding: "1.5rem 1.25rem 1.25rem 1.25rem",
            border: "1.5px solid var(--accent)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 18 }}>GLG Capital Group</span>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>Investment Assistant</div>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              style={{ 
                background: "none", 
                border: "none", 
                fontSize: 22, 
                color: "var(--primary)", 
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
              }}
            >
              &times;
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 8, fontSize: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.action)}
                  style={{
                    background: "var(--accent)",
                    color: "var(--primary)",
                    border: "none",
                    borderRadius: 16,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e6c200"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div style={{ flex: 1, overflow: "auto", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 8, fontSize: 14 }}>Frequently Asked Questions</div>
            <div style={{ maxHeight: "300px", overflow: "auto" }}>
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                  <button
                    onClick={() => setSelectedFaq(selectedFaq === idx ? null : idx)}
                    style={{
                      background: "none",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <div style={{ 
                      fontWeight: 500, 
                      color: "var(--foreground)", 
                      fontSize: 13,
                      lineHeight: "1.4",
                      marginBottom: 4,
                    }}>
                      {faq.q}
                    </div>
                  </button>
                  {selectedFaq === idx && (
                    <div style={{ 
                      color: "#555", 
                      fontSize: 12, 
                      lineHeight: "1.5",
                      marginTop: 6,
                      padding: "8px 12px",
                      background: "#f8f9fa",
                      borderRadius: 6,
                      borderLeft: "3px solid var(--accent)",
                    }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="chat-message" style={{ fontWeight: 500, color: "var(--primary)", fontSize: 14 }}>Send us a message:</label>
              <textarea
                id="chat-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Type your question or message..."
                style={{ 
                  borderRadius: 8, 
                  border: "1px solid #ccc", 
                  padding: 8, 
                  resize: "none", 
                  fontSize: 13,
                  outline: "none",
                }}
                required
              />
              <button
                type="submit"
                style={{ 
                  background: "var(--accent)", 
                  color: "var(--primary)", 
                  fontWeight: 600, 
                  border: "none", 
                  borderRadius: 8, 
                  padding: "8px 16px", 
                  fontSize: 14, 
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#e6c200"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
                disabled={sent}
              >
                {sent ? "✓ Message sent!" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 