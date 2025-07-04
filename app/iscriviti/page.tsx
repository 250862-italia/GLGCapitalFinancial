"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";

export default function IscrivitiPage() {
  // Registration form with password fields - Updated for deployment
  const router = useRouter();
  const { user, login, loginDirect } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  // Check if already registered
  useEffect(() => {
    setIsRegistered(!!user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      return false;
    }
    if (form.password !== form.confirmPassword) {
      return false;
    }
    if (form.password.length < 6) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
        setError("Please fill in all required fields");
      } else if (form.password !== form.confirmPassword) {
        setError("Passwords do not match");
      } else if (form.password.length < 6) {
        setError("Password must be at least 6 characters long");
      }
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/test-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.name.split(" ")[0] || form.name,
          lastName: form.name.split(" ").slice(1).join(" ") || form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        // Save basic data in kycData
        localStorage.setItem("kycData", JSON.stringify({
          firstName: form.name.split(" ")[0] || form.name,
          lastName: form.name.split(" ").slice(1).join(" ") || form.name,
          email: form.email,
          phone: form.phone
        }));
        
        // Auto login after registration
        if (data.user) {
          // Use direct login to bypass API
          const loginResult = await loginDirect(data.user);
          if (loginResult.success) {
            router.push("/dashboard");
          } else {
            // If auto login fails, go to login page
            router.push("/login");
          }
        } else {
          // Fallback: go to login page
          router.push("/login");
        }
      } else {
        setError(data.error || data.message || "Error during registration");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const loginResult = await login(loginForm.email, loginForm.password);
      if (loginResult.success) {
        setSuccess(true);
        router.push("/dashboard");
      } else {
        setError(loginResult.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)" }}>
      <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Client Registration</h1>
      {error && <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 8, padding: 12, marginBottom: 16 }}>{error}</div>}
      {success ? (
        <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 700, fontSize: 20 }}>
          {isRegistered ? "Login successful!" : "Registration completed!"}<br />You will receive a confirmation email.
        </div>
      ) : isRegistered ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>Email*</label>
            <input name="email" type="email" value={loginForm.email} onChange={handleLoginChange} style={inputStyle} required />
            <label>Password*</label>
            <input name="password" type="password" value={loginForm.password} onChange={handleLoginChange} style={inputStyle} required />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Full Name*</label>
            <input name="name" value={form.name} onChange={handleChange} style={inputStyle} required />
            <label>Email*</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} required />
            <label>Phone Number*</label>
            <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
            <label>Password*</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} style={inputStyle} required minLength={6} />
            <label>Confirm Password*</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} style={inputStyle} required minLength={6} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button type="submit" style={buttonStyle} disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
          </div>
        </form>
      )}
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginBottom: 16,
  fontSize: 16,
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  background: "#1a2238",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "0.75rem 2rem",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  marginLeft: 8,
}; 