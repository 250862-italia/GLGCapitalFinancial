export default function HomePage() {
  return (
    <main style={{ maxWidth: 1000, margin: '2rem auto', padding: '2.5rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(10,37,64,0.10)' }}>
      <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ color: '#0a2540', fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Empowering Your Financial Future</h2>
        <p style={{ color: '#1a3556', fontSize: 22, marginBottom: 0 }}>
          Premier investment banking and financial solutions for global clients.
        </p>
      </section>
      <section style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <div style={{ flex: 1, background: '#f5f8fa', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)' }}>
          <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 22 }}>Investment Banking & Advisory</h3>
          <p style={{ color: '#1a3556', fontSize: 16 }}>Strategic advice and capital solutions for corporations and institutions.</p>
        </div>
        <div style={{ flex: 1, background: '#f5f8fa', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)' }}>
          <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 22 }}>Asset Management</h3>
          <p style={{ color: '#1a3556', fontSize: 16 }}>Comprehensive portfolio management for individuals and organizations.</p>
        </div>
        <div style={{ flex: 1, background: '#f5f8fa', borderRadius: 10, padding: '2rem', boxShadow: '0 2px 8px rgba(10,37,64,0.04)' }}>
          <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 22 }}>Capital Markets</h3>
          <p style={{ color: '#1a3556', fontSize: 16 }}>Access to global markets and innovative financial products.</p>
        </div>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#0a2540', fontWeight: 700, fontSize: 24, marginBottom: 16 }}>Why Choose GLG Capital Group?</h3>
        <ul style={{ lineHeight: 2, color: '#1a3556', fontSize: 18 }}>
          <li>Experienced and dedicated professionals</li>
          <li>Client-centric approach</li>
          <li>Global reach, local expertise</li>
          <li>Integrity and transparency</li>
        </ul>
      </section>
    </main>
  );
}
