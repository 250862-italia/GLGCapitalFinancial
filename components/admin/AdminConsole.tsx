import React from 'react';
import { LogOut } from 'lucide-react';

interface AdminConsoleProps {
  logs: string[];
  onClear: () => void;
  onLogout?: () => void;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ logs, onClear, onLogout }) => {
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onLogout && (
            <button 
              onClick={onLogout} 
              style={{ 
                background: '#dc2626', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '4px 8px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <LogOut size={12} />
              Logout
            </button>
          )}
          <button onClick={onClear} style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Clear</button>
        </div>
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No logs</div>
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