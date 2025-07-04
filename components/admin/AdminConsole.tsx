import React from 'react';

interface AdminConsoleProps {
  logs: string[];
  onClear: () => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ logs, onClear }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 400,
      maxHeight: 300,
      background: '#1e293b',
      color: '#fff',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(30,41,59,0.18)',
      zIndex: 9999,
      padding: 16,
      overflowY: 'auto',
      fontFamily: 'monospace',
      fontSize: 13
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700 }}>Admin Console Log</span>
        <button onClick={onClear} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '2px 10px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Pulisci</button>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nessun log</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: 4, whiteSpace: 'pre-wrap' }}>{log}</div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminConsole; 