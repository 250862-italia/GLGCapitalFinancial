"use client";
import { useState, useEffect } from "react";

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
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>User Profile</h1>
      <p style={{ color: '#dc2626', fontSize: 18 }}>No KYC/profile data found. Please complete your KYC process.</p>
    </div>;
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>User Profile</h1>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(10,37,64,0.06)', padding: 24 }}>
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Personal Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ProfileField label="First Name" value={kyc.firstName} />
          <ProfileField label="Last Name" value={kyc.lastName} />
          <ProfileField label="Date of Birth" value={kyc.dateOfBirth} />
          <ProfileField label="Nationality" value={kyc.nationality} />
          <ProfileField label="Passport Number" value={kyc.passportNumber} />
          <ProfileField label="Passport Expiry" value={kyc.passportExpiry} />
          <ProfileField label="Address" value={kyc.address} />
          <ProfileField label="City" value={kyc.city} />
          <ProfileField label="Country" value={kyc.country} />
          <ProfileField label="Postal Code" value={kyc.postalCode} />
          <ProfileField label="Phone" value={kyc.phone} />
        </div>
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 700, margin: '32px 0 16px' }}>Financial Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ProfileField label="Employment Status" value={kyc.employmentStatus} />
          <ProfileField label="Employer Name" value={kyc.employerName} />
          <ProfileField label="Annual Income" value={kyc.annualIncome} />
          <ProfileField label="Source of Funds" value={kyc.sourceOfFunds} />
          <ProfileField label="Investment Experience" value={kyc.investmentExperience} />
          <ProfileField label="Risk Tolerance" value={kyc.riskTolerance} />
        </div>
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 700, margin: '32px 0 16px' }}>Banking Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ProfileField label="Bank Name" value={kyc.bankName} />
          <ProfileField label="Account Number" value={kyc.accountNumber} />
          <ProfileField label="Routing Number" value={kyc.routingNumber} />
          <ProfileField label="Account Type" value={kyc.accountType} />
        </div>
        <h2 style={{ color: '#0a2540', fontSize: 22, fontWeight: 700, margin: '32px 0 16px' }}>Compliance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ProfileField label="Politically Exposed" value={kyc.politicallyExposed ? 'Yes' : 'No'} />
          <ProfileField label="Sanctions Check" value={kyc.sanctionsCheck ? 'Yes' : 'No'} />
          <ProfileField label="Terms Accepted" value={kyc.termsAccepted ? 'Yes' : 'No'} />
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#1a3556', fontSize: 16, fontWeight: 500 }}>{value || <span style={{ color: '#d1d5db' }}>-</span>}</div>
    </div>
  );
}
