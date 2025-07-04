"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestRegistrationFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "Test",
    lastName: "User",
    email: `testuser${Date.now()}@example.com`,
    phone: "+1234567890",
    password: "TempPassword!2024"
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRegistration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data);
      
      if (data.success && data.user) {
        // Simula il salvataggio in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", "test-token-" + Date.now());
        setStep(2);
      }
    } catch (error) {
      setResult({ error: "Errore di rete" });
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const checkUserData = () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return { user: user ? JSON.parse(user) : null, token };
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Test Registration Flow</h1>
      
      {step === 1 && (
        <div>
          <h2>Step 1: Registration</h2>
          <div style={{ marginBottom: "1rem" }}>
            <strong>Form Data:</strong>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
          <button 
            onClick={handleRegistration}
            disabled={loading}
            style={{ padding: "0.5rem 1rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}
          >
            {loading ? "Processing..." : "Register User"}
          </button>
          
          {result && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f3f4f6", borderRadius: "4px" }}>
              <strong>Result:</strong>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: User Data Saved</h2>
          <div style={{ marginBottom: "1rem" }}>
            <strong>User Data in localStorage:</strong>
            <pre>{JSON.stringify(checkUserData(), null, 2)}</pre>
          </div>
          <button 
            onClick={goToDashboard}
            style={{ padding: "0.5rem 1rem", background: "#10b981", color: "white", border: "none", borderRadius: "4px" }}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
} 