"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Save, X, User, Mail, Phone, Shield } from 'lucide-react';

export default function PersonalInfoPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>({
    name: 'Admin User',
    email: 'admin@glgcapital.com',
    role: 'admin'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@glgcapital.com',
    phone: '+1 (555) 123-4567',
    role: 'admin'
  });

  const handleSave = () => {
    setAdminUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone || '',
      role: adminUser.role
    });
    setIsEditing(false);
  };

  if (!adminUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #1a2238',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#64748b' }}>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Informazioni Personali
          </h1>
          <p style={{ color: 'var(--foreground)', opacity: 0.8 }}>
            Gestisci il tuo profilo amministratore
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Edit size={16} />
            Modifica
          </button>
        )}
      </div>

      {/* Message */}
      <div style={{ 
        background: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: 8, 
        padding: '1rem', 
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Shield size={20} color="#16a34a" />
        <span style={{ color: '#16a34a', fontWeight: 600 }}>
          Accesso diretto abilitato - Autenticazione temporaneamente disabilitata
        </span>
      </div>

      {/* Profile Information */}
      <div style={{ background: 'var(--secondary)', borderRadius: 12, padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <User size={20} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Dettagli Profilo</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Name */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <User size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Nome</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 16
                }}
              />
            ) : (
              <p style={{ color: 'var(--foreground)', fontSize: 16, margin: 0 }}>{adminUser.name}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Mail size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Email</span>
            </div>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 16
                }}
              />
            ) : (
              <p style={{ color: 'var(--foreground)', fontSize: 16, margin: 0 }}>{adminUser.email}</p>
            )}
          </div>

          {/* Phone */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Phone size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Telefono</span>
            </div>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 16
                }}
              />
            ) : (
              <p style={{ color: 'var(--foreground)', fontSize: 16, margin: 0 }}>{adminUser.phone || 'Non specificato'}</p>
            )}
          </div>

          {/* Role */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 8, border: '1px solid #e0e3eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Ruolo</span>
            </div>
            <p style={{ color: 'var(--foreground)', fontSize: 16, margin: 0 }}>{adminUser.role}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#6b7280',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <X size={16} />
              Annulla
            </button>
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#10b981',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Save size={16} />
              Salva
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 