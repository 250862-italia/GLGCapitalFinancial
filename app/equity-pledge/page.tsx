"use client";

export default function EquityPledgePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ color: "#0a2540", fontSize: 38, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>
        Equity-Pledge System
      </h1>
      <p style={{ color: "#1a3556", fontSize: 20, lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}>
        Our Equity-Pledge model offers investors an innovative, secure, and transparent solution to achieve fixed returns and capital protection. Discover how it works and why more and more investors are choosing GLG Capital Group LLC.
      </p>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ color: "#f59e0b", fontSize: 28, fontWeight: 800, marginBottom: 18, textAlign: "center" }}>
          How Our Equity-Pledge Model Works
        </h2>
        <ul style={{ color: "#1a3556", fontSize: 18, lineHeight: 1.7, paddingLeft: 24, maxWidth: 700, margin: "0 auto" }}>
          <li><b>Dedicated Vehicle:</b> We create a dedicated vehicle company that issues shares reserved for investors.</li>
          <li><b>Simple Subscription:</b> Investors complete the online form, digitally sign the agreement, and transfer funds to a segregated account.</li>
          <li><b>Secured by Pledge:</b> Each investment is secured by a formal pledge on the newly issued shares.</li>
          <li><b>Fixed, Attractive Yield:</b> 12% gross per year (minus 0.7% management fee), paid at 36-month maturity.</li>
          <li><b>Transparent Reporting:</b> Quarterly reports keep investors informed about principal and accrued interest.</li>
          <li><b>Automatic Release:</b> At maturity, capital and net yield are returned and the pledge is released.</li>
        </ul>
      </section>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ color: "#0a2540", fontSize: 26, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>
          Why Choose the Equity-Pledge by GLG Capital Group?
        </h2>
        <ul style={{ color: "#1a3556", fontSize: 17, lineHeight: 1.7, paddingLeft: 24, maxWidth: 700, margin: "0 auto" }}>
          <li>Fixed and competitive returns</li>
          <li>Real protection of invested capital</li>
          <li>Maximum transparency and periodic reporting</li>
          <li>Simple and secure digital process</li>
          <li>Dedicated support at every stage</li>
        </ul>
      </section>
      <section style={{ margin: '60px 0', background: '#f8fafc', borderRadius: 16, padding: '2.5rem 1.5rem' }}>
        <h2 style={{ color: '#0a2540', fontSize: 30, fontWeight: 900, marginBottom: 24, textAlign: 'center' }}>
          How to Implement an "Equity Pledge" System in Your Company
        </h2>
        <p style={{ color: '#1a3556', fontSize: 18, lineHeight: 1.7, maxWidth: 800, margin: '0 auto 2.5rem', textAlign: 'center' }}>
          If you want to replicate the GLG Equity Pledge model—raising capital from investors at a fixed, guaranteed return secured by a pledge of your company's shares—follow these key steps:
        </p>
        <ol style={{ color: '#0a2540', fontSize: 17, lineHeight: 1.8, maxWidth: 800, margin: '0 auto', paddingLeft: 0 }}>
          <li style={{ marginBottom: 24 }}>
            <b>1. Create the Appropriate Corporate Vehicle</b><br />
            Establish a separate entity or branch (e.g. "MyCompany Italy Branch") whose articles expressly allow issuing dedicated shares to investors.<br />
            Define share capital, nominal value per share, and transfer restrictions clearly in the bylaws.
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>2. Prepare Your Legal Documentation</b><br />
            <ul style={{ margin: '8px 0 8px 24px', color: '#1a3556', fontSize: 16 }}>
              <li><b>Term Sheet:</b> outlines economics (term, yield, fees, repayment terms).</li>
              <li><b>Subscription & Pledge Agreement:</b> covers payment mechanics and pledge of shares as security.</li>
              <li><b>Appendices:</b> Subscription Form, Bank Details, Pledge Enforcement Procedures.</li>
            </ul>
            Engage a corporate law firm or notary to draft and review these documents for compliance and enforceability.
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>3. Secure Regulatory Approvals and Compliance</b><br />
            <ul style={{ margin: '8px 0 8px 24px', color: '#1a3556', fontSize: 16 }}>
              <li><b>KYC/AML:</b> implement a compliant onboarding workflow (ID checks, beneficial-owner screening, anti-money laundering screening).</li>
              <li>If you anticipate large-scale or public solicitations, verify whether any securities-law notifications or opinions (e.g. from your local regulator) are required—otherwise treat it as a private placement.</li>
            </ul>
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>4. Build Your Subscription Platform</b><br />
            <ul style={{ margin: '8px 0 8px 24px', color: '#1a3556', fontSize: 16 }}>
              <li>Develop a web portal or digital form where investors complete the Subscription Form and upload documents.</li>
              <li>Integrate an e-signature solution for executing the Subscription & Pledge Agreement.</li>
              <li>Provide a "Pay Now" button that issues an instruction with IBAN and payment reference automatically.</li>
            </ul>
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>5. Process Funds and Establish the Pledge</b><br />
            <ul style={{ margin: '8px 0 8px 24px', color: '#1a3556', fontSize: 16 }}>
              <li>Confirm receipt of investor wire transfers into a segregated escrow account.</li>
              <li>Register or deposit the pledged shares with a custodian or record the pledge in your shareholders' register in accordance with local law.</li>
            </ul>
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>6. Manage Investments and Reporting</b><br />
            <ul style={{ margin: '8px 0 8px 24px', color: '#1a3556', fontSize: 16 }}>
              <li>Track monthly contributions, interest accrual, and upcoming maturities.</li>
              <li>Distribute clear, periodic investor reports (e.g., quarterly) showing principal and interest earned.</li>
              <li>Maintain separate accounting for the pledged-share vehicle to ensure transparency.</li>
            </ul>
          </li>
          <li style={{ marginBottom: 24 }}>
            <b>7. Repay and Release the Pledge</b><br />
            At maturity, calculate net returns (e.g., 12% gross less 0.7% management fee) and execute wire transfers back to each investor's designated bank account.<br />
            Automatically release the pledge and return full ownership of shares to the issuer once obligations are settled.
          </li>
          <li style={{ marginBottom: 0 }}>
            <b>8. Provide Early-Exit Options</b><br />
            Offer investors a predefined early-exit mechanism—typically at a slight yield penalty—detailed in the Term Sheet and Subscription Agreement, for those who wish to redeem before maturity.
          </li>
        </ol>
      </section>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <a href="/iscriviti" style={{
          background: "#f59e0b",
          color: "#0a2540",
          padding: "1rem 2.5rem",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 20,
          boxShadow: "0 2px 8px rgba(245,158,11,0.10)",
          transition: "all 0.3s"
        }}>
          Start now: Register as an investor
        </a>
      </div>
    </main>
  );
}
