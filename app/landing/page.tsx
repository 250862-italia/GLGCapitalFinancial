export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h1>GLG Capital Group LLC</h1>
      <h2 style={{ color: '#0a2540', marginTop: '1rem' }}>Empowering Your Financial Future</h2>
      <p style={{ marginTop: '1.5rem' }}>
        GLG Capital Group LLC is a premier investment banking firm based in the United States, offering a full spectrum of financial services to individuals, corporations, and institutions. Our mission is to deliver innovative solutions, strategic advice, and exceptional results for our clients worldwide.
      </p>
      <section style={{ marginTop: '2rem' }}>
        <h3>Our Services</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>Investment Banking & Advisory</li>
          <li>Asset Management</li>
          <li>Capital Markets</li>
          <li>Corporate Finance</li>
          <li>Strategic Consulting</li>
        </ul>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h3>Why Choose GLG Capital Group?</h3>
        <ul style={{ lineHeight: 2 }}>
          <li>Experienced and dedicated professionals</li>
          <li>Client-centric approach</li>
          <li>Global reach, local expertise</li>
          <li>Integrity and transparency</li>
        </ul>
      </section>
    </main>
  );
}
