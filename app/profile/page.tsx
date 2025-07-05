"use client";
import { useState, useEffect } from "react";
import { User, Banknote, FileText, Shield, Mail, Phone, Calendar, Globe, Building, MapPin, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const [kyc, setKyc] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kycData");
      if (stored) setKyc(JSON.parse(stored));
    }
  }, []);

  if (!kyc) {
    return <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24, color: '#0a2540', textAlign: 'center' }}>User Profile</h1>
      <p style={{ color: '#dc2626', fontSize: 18, textAlign: 'center' }}>No KYC/profile data found. Please complete your KYC process.</p>
    </div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1rem', background: 'linear-gradient(135deg, #f8fafc 0%, #fef6e4 100%)', borderRadius: 24, boxShadow: '0 8px 32px rgba(10,37,64,0.10)' }}>
      {/* Header con avatar e nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36, borderBottom: '2px solid #f3f4f6', paddingBottom: 32 }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #0a2540 100%)', borderRadius: '50%', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(245,158,11,0.10)' }}>
          <User size={48} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#0a2540', margin: 0 }}>{kyc.firstName} {kyc.lastName}</h1>
          <div style={{ color: '#64748b', fontSize: 18, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mail size={18} style={{ marginRight: 4 }} /> {kyc.email || '-'}
            <Phone size={18} style={{ margin: '0 0 0 18px' }} /> {kyc.phone || '-'}
          </div>
        </div>
      </div>
      {/* Card dati personali */}
      <ProfileSection icon={<User size={22} color="#f59e0b" />} title="Personal Information">
        <ProfileGrid>
          <ProfileField label="First Name" value={kyc.firstName} />
          <ProfileField label="Last Name" value={kyc.lastName} />
          <ProfileField label="Date of Birth" value={kyc.dateOfBirth} icon={<Calendar size={16} />} />
          <ProfileField label="Nationality" value={kyc.nationality} icon={<Globe size={16} />} />
          <ProfileField label="Passport Number" value={kyc.passportNumber} />
          <ProfileField label="Passport Expiry" value={kyc.passportExpiry} />
          <ProfileField label="Address" value={kyc.address} icon={<MapPin size={16} />} />
          <ProfileField label="City" value={kyc.city} />
          <ProfileField label="Country" value={kyc.country} />
          <ProfileField label="Postal Code" value={kyc.postalCode} />
        </ProfileGrid>
      </ProfileSection>
      <ProfileSection icon={<Banknote size={22} color="#0a2540" />} title="Financial Information">
        <ProfileGrid>
          <ProfileField label="Employment Status" value={kyc.employmentStatus} />
          <ProfileField label="Employer Name" value={kyc.employerName} />
          <ProfileField label="Annual Income" value={kyc.annualIncome} />
          <ProfileField label="Source of Funds" value={kyc.sourceOfFunds} />
          <ProfileField label="Investment Experience" value={kyc.investmentExperience} />
          <ProfileField label="Risk Tolerance" value={kyc.riskTolerance} />
        </ProfileGrid>
      </ProfileSection>
      <ProfileSection icon={<CreditCard size={22} color="#059669" />} title="Banking Information">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Manage your banking details for investments</span>
          <a 
            href="/profile/banking" 
            style={{
              background: '#059669',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 6,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Edit Banking Info
          </a>
        </div>
        <ProfileGrid>
          <ProfileField label="Bank Name" value={kyc.bankName} />
          <ProfileField label="Account Number" value={kyc.accountNumber} />
          <ProfileField label="Routing Number" value={kyc.routingNumber} />
          <ProfileField label="Account Type" value={kyc.accountType} />
        </ProfileGrid>
      </ProfileSection>
      <ProfileSection icon={<Shield size={22} color="#3b82f6" />} title="Compliance">
        <ProfileGrid>
          <ProfileField label="Politically Exposed" value={kyc.politicallyExposed ? 'Yes' : 'No'} />
          <ProfileField label="Sanctions Check" value={kyc.sanctionsCheck ? 'Yes' : 'No'} />
          <ProfileField label="Terms Accepted" value={kyc.termsAccepted ? 'Yes' : 'No'} />
        </ProfileGrid>
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section style={{ margin: '2.5rem 0', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(10,37,64,0.06)', padding: '2rem 1.5rem', borderLeft: '6px solid #f59e0b' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        {icon}
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 800, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      {children}
    </div>
  );
}

function ProfileField({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10, background: '#f8fafc', borderRadius: 8, padding: '0.75rem 1rem', boxShadow: '0 1px 3px rgba(10,37,64,0.04)', transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon && <span>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#1a3556', fontSize: 16, fontWeight: 500 }}>{value || <span style={{ color: '#d1d5db' }}>-</span>}</div>
      </div>
    </div>
  );
}
