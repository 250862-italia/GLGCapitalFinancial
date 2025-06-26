"use client";
import { useState } from "react";

const faqs = [
  { q: "How can I view my investments?", a: "Log in to your reserved area and select 'Investments' from the menu." },
  { q: "How do I upload documents?", a: "Go to the 'Documents' section in your dashboard and use the upload button." },
  { q: "Who can I contact for support?", a: "You can use this chat or email us at corefound@glgcapitalgroupllc.com." },
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <>
      {/* Icona chat fissa */}
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
        }}
        aria-label="Open chat"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FFD700"/><path d="M7 10h10M7 14h6" stroke="#1A2238" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {/* Finestra chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 110,
            right: 32,
            width: 340,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(10,37,64,0.18)",
            zIndex: 1001,
            padding: "1.5rem 1.25rem 1.25rem 1.25rem",
            border: "1.5px solid var(--accent)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 18 }}>GLG Chatbot</span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontSize: 22, color: "var(--primary)", cursor: "pointer" }}>&times;</button>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>Frequently Asked Questions</div>
            <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
              {faqs.map((faq, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 500, color: "var(--foreground)", fontSize: 15 }}>{faq.q}</div>
                  <div style={{ color: "#555", fontSize: 14, marginLeft: 6 }}>{faq.a}</div>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label htmlFor="chat-message" style={{ fontWeight: 500, color: "var(--primary)", fontSize: 15 }}>Leave us a message:</label>
            <textarea
              id="chat-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Type your message..."
              style={{ borderRadius: 8, border: "1px solid #ccc", padding: 8, resize: "none", fontSize: 15 }}
              required
            />
            <button
              type="submit"
              style={{ background: "var(--accent)", color: "var(--primary)", fontWeight: 700, border: "none", borderRadius: 8, padding: "0.5rem 0", fontSize: 16, marginTop: 4, cursor: "pointer" }}
              disabled={sent}
            >
              {sent ? "Message sent!" : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
} 