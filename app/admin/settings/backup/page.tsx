"use client";

import { useState, useEffect } from 'react';
import { backupService, type BackupMetadata } from '../../../../lib/backup-service';

export default function AdminSettingsBackupPage() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [currentBackup, setCurrentBackup] = useState<BackupMetadata | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const backupList = backupService.getBackups();
    setBackups(backupList);
    setStats(backupService.getBackupStats());
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const newBackup = await backupService.createBackup('Manual backup from admin panel');
      setCurrentBackup(newBackup);
      
      // Wait for backup to complete
      const checkStatus = setInterval(() => {
        const updatedBackups = backupService.getBackups();
        const updatedBackup = updatedBackups.find(b => b.id === newBackup.id);
        
        if (updatedBackup && updatedBackup.status === 'completed') {
          setCurrentBackup(null);
          loadBackups();
          clearInterval(checkStatus);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Backup failed:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await backupService.deleteBackup(backupId);
      loadBackups();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato';
      case 'failed': return 'Fallito';
      case 'in_progress': return 'In corso';
      default: return 'Sconosciuto';
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(10,37,64,0.10)', padding: '2rem' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Backup & Ripristino</h1>
      <p style={{ color: 'var(--foreground)', fontSize: 18, opacity: 0.8, marginBottom: '2rem' }}>
        Gestisci i backup del sistema e monitora lo stato delle operazioni.
      </p>

      {/* Backup Statistics */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Backup Totali</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalBackups}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Ultimo Backup</h3>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {stats.lastBackup ? formatDate(stats.lastBackup) : 'Nessuno'}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tasso di Successo</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>
              {stats.successRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Dimensione Totale</h3>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{formatSize(stats.totalSize)}</p>
          </div>
        </div>
      )}

      {/* Create Backup Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isCreatingBackup ? 'not-allowed' : 'pointer',
            opacity: isCreatingBackup ? 0.6 : 1
          }}
        >
          {isCreatingBackup ? 'Creazione Backup...' : 'Crea Nuovo Backup'}
        </button>
      </div>

      {/* Current Backup Progress */}
      {currentBackup && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '8px' }}>Backup in Corso</h3>
          <p style={{ color: '#856404', marginBottom: '4px' }}>
            ID: {currentBackup.id}
          </p>
          <p style={{ color: '#856404' }}>
            Descrizione: {currentBackup.description}
          </p>
        </div>
      )}

      {/* Backup List */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem' }}>Cronologia Backup</h2>
        
        {backups.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Nessun backup disponibile.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {backups.map((backup) => (
              <div
                key={backup.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  background: '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {backup.description}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                      ID: {backup.id}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Creato: {formatDate(backup.timestamp)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={getStatusColor(backup.status)} style={{ fontWeight: 'bold' }}>
                      {getStatusText(backup.status)}
                    </span>
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {formatSize(backup.size)}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => backupService.exportBackup(backup.id)}
                    disabled={backup.status !== 'completed'}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: backup.status !== 'completed' ? 'not-allowed' : 'pointer',
                      opacity: backup.status !== 'completed' ? 0.5 : 1
                    }}
                  >
                    Esporta
                  </button>
                  <button
                    onClick={() => handleDeleteBackup(backup.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 