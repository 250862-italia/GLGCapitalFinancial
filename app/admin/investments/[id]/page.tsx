"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, User } from 'lucide-react';

interface InvestmentDetail {
  id: string;
  user: { id: string; name: string; email: string };
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  maturity: string;
  yield: number;
  history: Array<{ date: string; value: number }>;
  notes: Array<{ date: string; text: string }>;
}

export default function InvestmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [investment, setInvestment] = useState<InvestmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params?.id) {
      loadInvestmentDetail(params.id as string);
    }
  }, [params?.id]);

  const loadInvestmentDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/investments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInvestment(data);
      } else {
        console.error('Failed to load investment details');
        // Fallback to mock data if API fails
        const mockInvestment: InvestmentDetail = {
          id: "1",
          user: { id: "u1", name: "Mario Rossi", email: "mario@rossi.com" },
          type: "Equity Pledge",
          amount: 100000,
          status: "active",
          createdAt: "2023-01-10",
          maturity: "2026-01-10",
          yield: 0.12,
          history: [
            { date: "2023-01-10", value: 100000 },
            { date: "2023-02-10", value: 101000 },
            { date: "2023-03-10", value: 102000 },
            { date: "2023-04-10", value: 103000 },
            { date: "2023-05-10", value: 104000 },
            { date: "2023-06-10", value: 105000 },
            { date: "2023-07-10", value: 106000 },
            { date: "2023-08-10", value: 107000 },
            { date: "2023-09-10", value: 108000 },
            { date: "2023-10-10", value: 109000 },
            { date: "2023-11-10", value: 110000 },
            { date: "2023-12-10", value: 111000 },
          ],
          notes: [
            { date: "2023-01-10", text: "Investimento creato" },
            { date: "2023-06-10", text: "Rendimento trimestrale accreditato" },
          ],
        };
        setInvestment(mockInvestment);
      }
    } catch (error) {
      console.error('Error loading investment details:', error);
      setError('Failed to load investment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading investment details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Investment not found</div>
      </div>
    );
  }

  // Calcolo rendimenti
  const dailyYield = ((investment.yield * investment.amount) / 365).toFixed(2);
  const monthlyYield = ((investment.yield * investment.amount) / 12).toFixed(2);
  const annualYield = (investment.yield * investment.amount).toFixed(2);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(10,37,64,0.10)", padding: "2.5rem", marginTop: 32 }}>
      <button onClick={() => router.push("/admin/investments")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 24, cursor: "pointer" }}>
        <ArrowLeft size={20} /> Torna alla lista investimenti
      </button>
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 32 }}>
        <div style={{ flex: 2 }}>
          <h1 style={{ color: "var(--primary)", fontSize: 32, fontWeight: 900, margin: 0 }}>Dettaglio Investimento</h1>
          <div style={{ margin: "1.5rem 0" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0a2540" }}>€{investment.amount.toLocaleString()}</div>
            <div style={{ color: "#1a3556", fontSize: 16, marginTop: 4 }}>{investment.type}</div>
            <div style={{ color: investment.status === "active" ? "#16a34a" : "#92400e", fontWeight: 600, marginTop: 4 }}>{investment.status === "active" ? "Attivo" : "Chiuso"}</div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Creato il: {investment.createdAt} | Scadenza: {investment.maturity}</div>
          </div>
          <div style={{ margin: "1rem 0" }}>
            <span style={{ color: "#0a2540", fontWeight: 600 }}>Utente: </span>
            <button onClick={() => router.push(`/admin/users/${investment.user.id}`)} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <User size={16} /> {investment.user.name}
            </button>
            <span style={{ color: "#64748b", fontSize: 14, marginLeft: 8 }}>{investment.user.email}</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <button style={{ background: "#f59e0b", color: "white", border: "none", borderRadius: 8, padding: "0.75rem 1rem", fontWeight: 700, fontSize: 16, marginBottom: 8, cursor: "pointer" }}><Edit size={18} style={{ marginRight: 6 }} /> Modifica</button>
          <button style={{ background: "#dc2626", color: "white", border: "none", borderRadius: 8, padding: "0.75rem 1rem", fontWeight: 700, fontSize: 16, cursor: "pointer" }}><Trash2 size={18} style={{ marginRight: 6 }} /> Elimina</button>
        </div>
      </section>
      {/* Andamento investimento (grafico mock SVG) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#0a2540", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Andamento Investimento</h2>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24, marginBottom: 16 }}>
          {/* SVG grafico mock */}
          <svg width="100%" height="180" viewBox="0 0 600 180">
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              points="0,160 50,155 100,150 150,145 200,140 250,135 300,130 350,125 400,120 450,115 500,110 550,105 600,100"
            />
            <text x="10" y="30" fontSize="16" fill="#64748b">Valore (€)</text>
            <text x="500" y="170" fontSize="14" fill="#64748b">Mesi</text>
          </svg>
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Andamento simulato. Collegare a dati reali per visualizzazione precisa.</div>
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#0a2540" }}>Rendimento Giornaliero</div>
            <div style={{ fontSize: 18, color: "#16a34a", fontWeight: 700 }}>€{dailyYield}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0a2540" }}>Rendimento Mensile</div>
            <div style={{ fontSize: 18, color: "#0ea5e9", fontWeight: 700 }}>€{monthlyYield}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#0a2540" }}>Rendimento Annuale</div>
            <div style={{ fontSize: 18, color: "#f59e0b", fontWeight: 700 }}>€{annualYield}</div>
          </div>
        </div>
      </section>
      {/* Tabella rendimenti storici (mock) */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ color: "#0a2540", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Rendimenti Storici</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e0e3eb" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>Data</th>
                <th style={{ textAlign: "right", padding: "0.75rem" }}>Valore (€)</th>
              </tr>
            </thead>
            <tbody>
              {investment.history.map((h) => (
                <tr key={h.date} style={{ borderBottom: "1px solid #e0e3eb" }}>
                  <td style={{ padding: "0.75rem" }}>{h.date}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>€{h.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Cronologia/Note */}
      <section>
        <h2 style={{ color: "#0a2540", fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Cronologia</h2>
        <ul style={{ color: "#64748b", fontSize: 15, paddingLeft: 24 }}>
          {investment.notes.map((n) => (
            <li key={n.date}><b>{n.date}:</b> {n.text}</li>
          ))}
        </ul>
      </section>
    </div>
  );
} 