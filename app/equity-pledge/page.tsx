"use client";

export default function EquityPledgePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ color: "#0a2540", fontSize: 38, fontWeight: 900, marginBottom: 24, textAlign: "center" }}>
        Our Equity-Pledge Model at a Glance
      </h1>
      <ul style={{ color: "#1a3556", fontSize: 20, lineHeight: 1.7, textAlign: "left", margin: "0 auto 32px", maxWidth: 700, paddingLeft: 0, listStyle: "none" }}>
        <li><b>Legal Vehicle</b><br />Dedicated branch/subsidiary for investor shares</li>
        <li><b>Documentation</b><br />Simple Term Sheet & Digital Subscription Agreement</li>
        <li><b>Compliance</b><br />Seamless KYC/AML checks</li>
        <li><b>Online Onboarding</b><br />E-form, e-signature & "Pay Now" integration</li>
        <li><b>Escrow & Pledge</b><br />Funds in segregated account + formal share pledge</li>
        <li><b>Fixed Yield</b><br />XXXX % p.a. (minus XXXX % fee), paid at 12/24/36/48-month maturity</li>
        <li><b>Transparent Reporting</b><br />Quarterly statements on principal & interest</li>
        <li><b>Maturity & Release</b><br />Automatic repayment + pledge lift</li>
        <li><b>Early Exit</b><br />Optional early redemption at predefined terms</li>
      </ul>
      <p style={{ color: "#1a3556", fontSize: 20, lineHeight: 1.7, textAlign: "center", marginBottom: 32 }}>
        A streamlined, secure way to raise capital—with predictable returns and rock-solid collateral.
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
