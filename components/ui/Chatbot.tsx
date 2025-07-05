"use client";
import { useState } from "react";

const faqs = [
  { 
    q: "What services does GLG Capital Group offer?", 
    a: "GLG Capital Group offers professional investment banking and financial advisory services. We provide strategic advice, capital solutions, asset management, and access to global markets for corporations and institutions." 
  },
  { 
    q: "How do I register and start investing?", 
    a: "Click 'Register' on our homepage to start. The process includes: 1) Personal information, 2) KYC document verification, 3) Investment consultation, 4) Service agreement. Our team will guide you through the entire process." 
  },
  { 
    q: "What investment services are available?", 
    a: "We offer comprehensive investment banking services including: M&A advisory, capital raising, debt financing, equity investments, asset management, and strategic consulting. Each service is tailored to your specific needs and goals." 
  },
  { 
    q: "How does the investment process work?", 
    a: "Our investment process follows a structured approach: 1) Initial consultation and needs assessment, 2) Strategy development, 3) Due diligence and analysis, 4) Execution and implementation, 5) Ongoing monitoring and optimization." 
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
    a: "We accept: Bank transfers (IBAN), wire transfers, and corporate payment methods. All payments are processed securely through our encrypted payment gateway. Payment terms are discussed during the consultation phase." 
  },
  { 
    q: "How can I track my investments?", 
    a: "After registration and KYC approval, our team will provide you with regular reports and updates on your investments. We offer comprehensive reporting including performance analysis, market updates, and strategic recommendations." 
  },
  { 
    q: "Is my investment secure?", 
    a: "Yes, all investments are secured through our professional risk management system. We use bank-grade encryption, secure payment processing, and maintain strict compliance with financial regulations. Your funds are protected by our comprehensive security protocols." 
  },
  { 
    q: "Can I withdraw my investments?", 
    a: "Investment withdrawal terms depend on the specific investment agreement and market conditions. Our team will discuss all terms and conditions during the initial consultation and provide clear guidelines for any exit strategies." 
  },
  { 
    q: "What currencies are supported?", 
    a: "We support multiple currencies: USD, EUR, GBP, CHF, and JPY. You can select your preferred currency during the consultation phase. All transactions and reports are provided in your chosen currency." 
  },
  { 
    q: "How do I contact support?", 
    a: "Use this chat, email us at corefound@glgcapitalgroupllc.com, or call our support line. Our team is available during business hours to assist with registration, KYC, investments, and general inquiries." 
  },
  { 
    q: "What is the minimum investment?", 
    a: "Minimum investment requirements vary based on the specific service and investment opportunity. We work with clients of all sizes, from individual investors to large institutions. Contact us for a personalized consultation." 
  },
  { 
    q: "How often are reports provided?", 
    a: "We provide regular reports based on your investment agreement. Typically, clients receive monthly performance reports, quarterly reviews, and annual comprehensive analysis. Additional reports are available upon request." 
  },
  { 
    q: "What happens if I need to modify my investment strategy?", 
    a: "Investment strategy modifications are possible based on market conditions and your changing needs. Our team will work with you to assess the current situation and recommend appropriate adjustments to your investment strategy." 
  }
];

const quickActions = [
  { label: "View Services", action: "services" },
  { label: "Start Registration", action: "register" },
  { label: "KYC Process", action: "kyc" },
  { label: "Payment Methods", action: "payments" },
  { label: "Investment Tracking", action: "tracking" },
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
      case "services":
        window.location.href = "/about";
        break;
      case "register":
        window.location.href = "/login";
        break;
      case "kyc":
        setSelectedFaq(4); // KYC FAQ
        break;
      case "payments":
        setSelectedFaq(6); // Payment methods FAQ
        break;
      case "tracking":
        setSelectedFaq(7); // Investment tracking FAQ
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
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>Quick Actions:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  style={{
                    background: "var(--accent)",
                    color: "var(--primary)",
                    border: "none",
                    padding: "0.5rem 0.75rem",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>Frequently Asked Questions:</div>
            {filteredFaqs.map((faq, index) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <button
                  onClick={() => setSelectedFaq(selectedFaq === index ? null : index)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: "0.75rem",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--primary)",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {faq.q}
                </button>
                {selectedFaq === index && (
                  <div style={{
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: 8,
                    marginTop: 4,
                    fontSize: 13,
                    color: "#374151",
                    lineHeight: 1.5,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>Send us a message:</div>
            <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                style={{
                  background: message.trim() ? "var(--accent)" : "#e5e7eb",
                  color: message.trim() ? "var(--primary)" : "#9ca3af",
                  border: "none",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: message.trim() ? "pointer" : "not-allowed",
                }}
              >
                Send
              </button>
            </form>
            {sent && (
              <div style={{
                marginTop: 8,
                padding: "0.5rem",
                background: "#f0fdf4",
                color: "#16a34a",
                borderRadius: 6,
                fontSize: 12,
                textAlign: "center",
              }}>
                Message sent! We'll get back to you soon.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 