export default function Footer() {
  return (
    <footer style={{
      background: '#1f2937',
      color: '#fff',
      padding: '2rem',
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>GLG Capital Consulting LLC</h3>
          <p style={{ lineHeight: 1.6, opacity: 0.8, marginBottom: '1rem' }}>
            Empowering your financial future with innovative investment solutions and strategic capital management.
          </p>
          <div style={{ opacity: 0.8 }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Legal Address:</strong><br />
              1309 Coffeen Avenue, STE 1200<br />
              Sheridan, Wyoming 82801 (USA)
            </p>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Phone:</strong> +1 (307) 263-0876
            </p>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Email:</strong> corefound@glgcapitalgroupllc.com
            </p>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Services</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/investments" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Investments</a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/live-markets" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Live Markets</a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <a href="/register" style={{ color: '#fff', textDecoration: 'none', opacity: 0.8 }}>Client Registration</a>
            </li>
          </ul>
        </div>
      </div>
      <div style={{ 
        borderTop: '1px solid #374151', 
        marginTop: '2rem', 
        paddingTop: '1rem',
        textAlign: 'center',
        opacity: 0.6
      }}>
        <p>&copy; 2024 GLG Capital Consulting LLC. All rights reserved.</p>
      </div>
    </footer>
  );
} 