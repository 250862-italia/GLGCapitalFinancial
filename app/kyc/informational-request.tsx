"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";

const FORM_TEXT = `Informational Request Form\nGLG Equity Pledge\nInvolved Entities:\n* GLG Capital Consulting LLC (USA)\n* Magnificus Dominus Consulting Europe Srl (Italy)\n\n1. Subject of the Request\nI, the undersigned, as a prospective participant, hereby request detailed information regarding the "GLG Equity Pledge" program, including but not limited to:\n* Operational and legal structure\n* Financial terms and durations\n* Share pledge mechanism\n* Repayment procedures and timelines\n* Key risks and safeguards\n2. Applicant's Declarations\n* Voluntariness: I declare that this request is made of my own free will, without any solicitation or promotional activities by GLG Capital Consulting LLC, Magnificus Dominus Consulting Europe Srl, or their agents.\n* Informational Purpose: I understand that the information provided is purely informational and does not constitute a contractual offer, investment advice, or recommendation under applicable securities laws.\n* Independent Evaluation: I commit to independently assess, and if needed consult professional advisors on, the suitability of any potential investment decision.\n3. Data Processing Consent (EU GDPR 2016/679)\nI authorize GLG Capital Consulting LLC and Magnificus Dominus Consulting Europe Srl to process my personal data solely for the purposes of:\n* Providing the requested information\n* Complying with legal AML/KYC requirements\nMy data will not be shared with third parties for any other purposes.\n4. U.S. Regulatory References\nBy submitting this form, you acknowledge that GLG Capital Consulting LLC operates in compliance with the following key U.S. laws and regulations:\n* Securities Act of 1933 & Securities Exchange Act of 1934: Governing private placements and exempt offerings under Regulation D.\n* Bank Secrecy Act (BSA) & USA PATRIOT Act: Mandating customer identification (CIP), suspicious activity monitoring, and AML due diligence.\n* Investment Advisers Act of 1940: Applicable to advisory activities and fiduciary standards for U.S. investors.\n* California Consumer Privacy Act (CCPA): Protecting personal data and consumer privacy for California residents.\n5. Submission Channels\nPlease send the requested information via one of the following:\n* Email: info@glgcapitalconsulting.com\n* Certified Email (PEC): glgconsulting@pec.it\n* Online: Complete the form at www.glgequitypledge.com/information\n5. Digital Signature\nBy signing below, I confirm that I have read, understood, and accepted the terms above.\n* Name: __________________________\n* Date: ____ / ____ / ______\n* Digital Signature: __________________________\n\nThank you for your interest. We will respond with the requested details within 3 business days.`;

export default function InformationalRequestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: new Date().toISOString().slice(0, 10),
    signature: "",
    accepted: false,
    sending: false,
    sent: false,
    error: ""
  });

  // Precompila nome/email da localStorage (utente loggato)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) setForm(f => ({ ...f, name: user.name || (user.first_name + " " + user.last_name), email: user.email }));
    }
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setForm(f => ({ ...f, sending: true, error: "" }));
    try {
      // Invia email a GLG
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: ["info@glgcapitalconsulting.com", "glgconsulting@pec.it"],
          subject: "Informational Request Form - GLG Equity Pledge",
          html: `<pre>${FORM_TEXT}</pre><br/><b>Name:</b> ${form.name}<br/><b>Email:</b> ${form.email}<br/><b>Date:</b> ${form.date}<br/><b>Digital Signature:</b> ${form.signature}`
        })
      });
      // (Opzionale) log su Supabase
      await fetch("/api/informational-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          date: form.date,
          signature: form.signature
        })
      });
      setForm(f => ({ ...f, sending: false, sent: true }));
    } catch (err) {
      setForm(f => ({ ...f, sending: false, error: "Errore invio richiesta. Riprova." }));
    }
  };

  if (form.sent) {
    return <div style={{ padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
      <h2>Richiesta inviata!</h2>
      <p>Riceverai una risposta entro 3 giorni lavorativi.</p>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', maxWidth: 600, margin: '40px auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Informational Request Form</h1>
      <textarea value={FORM_TEXT} readOnly rows={18} style={{ width: '100%', marginBottom: 16, fontSize: 14, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }} />
      <div style={{ marginBottom: 16 }}>
        <label>Nome e Cognome</label>
        <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 8 }} />
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} required type="email" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 8 }} />
        <label>Data</label>
        <input name="date" value={form.date} onChange={handleChange} required type="date" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 8 }} />
        <label>Firma digitale</label>
        <input name="signature" value={form.signature} onChange={handleChange} required placeholder="Scrivi il tuo nome e cognome" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #d1d5db', marginBottom: 8 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" name="accepted" checked={form.accepted} onChange={handleChange} required /> Accetto e sottoscrivo digitalmente quanto sopra
        </label>
      </div>
      {form.error && <div style={{ color: '#dc2626', marginBottom: 12 }}>{form.error}</div>}
      <button type="submit" disabled={form.sending || !form.accepted} style={{ background: '#1a2238', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>
        {form.sending ? 'Invio...' : 'Invia richiesta'}
      </button>
    </form>
  );
} 