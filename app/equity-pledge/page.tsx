"use client";

export default function EquityPledgePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ color: "#0a2540", fontSize: 38, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>
        Equity-Pledge Business Model by GLG Capital Group LLC
      </h1>
      <p style={{ color: "#1a3556", fontSize: 22, lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}>
        An innovative, secure approach to fuel corporate growth by combining fixed returns with real collateral.
      </p>

      {/* 1. Vision & Goal */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>1. Vision & Goal</h2>
        <p style={textStyle}>
          Imagine your business expanding without being bound by traditional lending constraints.<br /><br />
          With our Equity-Pledge system, you transform your own shares into strategic financing power: unlock capital on favorable terms while retaining full control.
        </p>
        <blockquote style={quoteStyle}>
          “Every decision you make today shapes your tomorrow. Choose a path of precision and security: pledge your equity, secure your future.”
        </blockquote>
      </section>

      {/* 2. Legal Vehicle Structure */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>2. Legal Vehicle Structure</h2>
        <p style={textStyle}>
          A dedicated branch or subsidiary (e.g., “MyCompany Italy Branch”) is established, empowered to issue investor-specific shares.
        </p>
        <ul style={listStyle}>
          <li>Creation of tailored share classes</li>
          <li>Transfer restrictions to ensure stability</li>
          <li>Clear, binding pledge provisions</li>
        </ul>
      </section>

      {/* 3. Subscription & Onboarding */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>3. Subscription & Onboarding</h2>
        <ol style={listStyle}>
          <li>Investors fill out the online form and digitally sign the Subscription Agreement.</li>
          <li>Funds are transferred into a segregated escrow account, guaranteeing security.</li>
          <li>Our system instantly confirms receipt and formalizes the share pledge.</li>
        </ol>
        <blockquote style={quoteStyle}>
          “With each click, you take control of your financial destiny: clarity empowers confidence.”
        </blockquote>
      </section>

      {/* 4. Collateral & Pledge */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>4. Collateral & Pledge</h2>
        <p style={textStyle}>
          Upon funding, the newly issued shares are formally pledged as collateral.<br /><br />
          Enforcement is documented via:
        </p>
        <ul style={listStyle}>
          <li>Official register entry</li>
          <li>Digital records accessible anytime</li>
        </ul>
        <p style={textStyle}>
          In case of non-repayment, pledge enforcement is automated: shares are liquidated to satisfy the debt.
        </p>
      </section>

      {/* 5. Fixed Returns & Security */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>5. Fixed Returns & Security</h2>
        <ul style={listStyle}>
          <li>Guaranteed gross yield: 12% p.a.</li>
          <li>Management fee: 0.7% of interest earned</li>
          <li>36-month term with automatic repayment of principal plus net returns.</li>
        </ul>
        <blockquote style={quoteStyle}>
          “When you know exactly what you'll earn, you can focus on growing your core business.”
        </blockquote>
      </section>

      {/* 6. Transparent Reporting */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>6. Transparent Reporting</h2>
        <ul style={listStyle}>
          <li>Quarterly reports include:</li>
          <ul style={{ marginLeft: 24 }}>
            <li>Invested principal</li>
            <li>Accrued interest</li>
            <li>Pledge status</li>
          </ul>
          <li>24/7 access to a dedicated dashboard: complete transparency, zero surprises.</li>
        </ul>
      </section>

      {/* 7. Early Exit Option */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>7. Early Exit Option</h2>
        <ul style={listStyle}>
          <li>Should an investor choose to exit early:</li>
          <ul style={{ marginLeft: 24 }}>
            <li>Predefined early redemption terms apply</li>
            <li>Conditions detailed in the Term Sheet and Agreement</li>
          </ul>
        </ul>
        <blockquote style={quoteStyle}>
          “Maintain your power to choose: exit when it serves your strategy.”
        </blockquote>
      </section>

      {/* 8. Key Benefits */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>8. Key Benefits</h2>
        <ul style={listStyle}>
          <li>Predictable returns higher than many traditional options</li>
          <li>Real capital protection via equity pledge</li>
          <li>Streamlined digital process: fast, secure, and paperless</li>
          <li>Flexible terms: customizable and scalable for your needs</li>
        </ul>
      </section>

      {/* 9. Ready to Secure Your Tomorrow? */}
      <section style={blockStyle}>
        <h2 style={titleStyle}>9. Ready to Secure Your Tomorrow?</h2>
        <p style={textStyle}>
          Discover how GLG Capital Group LLC's Equity-Pledge model can elevate your enterprise.<br />
          <b>Contact our team for a free, personalized consultation and forge the path to lasting success.</b>
        </p>
      </section>
    </main>
  );
}

const blockStyle = {
  background: '#f8fafc',
  borderRadius: 16,
  padding: '2rem 1.5rem',
  marginBottom: 32,
  boxShadow: '0 2px 8px rgba(10,37,64,0.06)'
};

const titleStyle = {
  color: '#0a2540',
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 16,
  textAlign: 'left' as const
};

const textStyle = {
  color: '#1a3556',
  fontSize: 18,
  lineHeight: 1.7,
  marginBottom: 12
};

const listStyle = {
  color: '#1a3556',
  fontSize: 17,
  lineHeight: 1.7,
  marginBottom: 12,
  paddingLeft: 24
};

const quoteStyle = {
  color: '#f59e0b',
  fontSize: 18,
  fontStyle: 'italic',
  margin: '18px 0 0 0',
  paddingLeft: 16,
  borderLeft: '4px solid #f59e0b',
  background: '#fffbe6',
  borderRadius: 8
};
