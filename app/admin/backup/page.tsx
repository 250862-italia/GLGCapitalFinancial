"use client";
import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, RefreshCw, Plus, Eye, AlertTriangle, CheckCircle, Clock, BarChart3, Database, FileText, Shield, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createBackupService, BackupData } from '@/lib/backup-service';

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const [selectedBackup, setSelectedBackup] = useState<BackupData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  
  // Form states
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [backupOptions, setBackupOptions] = useState({
    include_clients: true,
            include_investments: true,
            include_notifications: true
  });
  const [restoreOptions, setRestoreOptions] = useState({
    overwrite_existing: false,
    validate_data: true,
    create_backup_before_restore: true
  });
  const [importFile, setImportFile] = useState<File | null>(null);

  const backupService = createBackupService(supabase);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    setError(null);
    try {
      const backupsData = await backupService.getBackups();
      setBackups(backupsData);
      
      // Get statistics
      const statsData = await backupService.getBackupStatistics();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento dei backup');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!backupName.trim()) {
      alert('Inserisci un nome per il backup');
      return;
    }

    setCreatingBackup(true);
    try {
      await backupService.createBackup(
        backupName,
        backupDescription,
        backupOptions,
        'admin'
      );
      
      setBackupName('');
      setBackupDescription('');
      setShowCreateModal(false);
      fetchBackups();
      alert('Backup creato con successo!');
    } catch (err: any) {
      alert('Errore nella creazione del backup: ' + err.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Sei sicuro di voler ripristinare questo backup? Questa operazione può sovrascrivere i dati esistenti.')) {
      return;
    }

    setRestoringBackup(true);
    try {
      await backupService.restoreBackup(backupId, restoreOptions);
      setShowRestoreModal(false);
      alert('Backup ripristinato con successo!');
    } catch (err: any) {
      alert('Errore nel ripristino del backup: ' + err.message);
    } finally {
      setRestoringBackup(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo backup?')) {
      return;
    }

    try {
      await backupService.deleteBackup(backupId);
      fetchBackups();
      alert('Backup eliminato con successo!');
    } catch (err: any) {
      alert('Errore nell\'eliminazione del backup: ' + err.message);
    }
  };

  const exportBackup = async (backupId: string) => {
    try {
      const backupData = await backupService.exportBackup(backupId);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${backupId}.json`;
      a.click();
    } catch (err: any) {
      alert('Errore nell\'esportazione del backup: ' + err.message);
    }
  };

  const importBackup = async () => {
    if (!importFile) {
      alert('Seleziona un file da importare');
      return;
    }

    setImportingBackup(true);
    try {
      const fileContent = await importFile.text();
      await backupService.importBackup(fileContent);
      setImportFile(null);
      setShowImportModal(false);
      fetchBackups();
      alert('Backup importato con successo!');
    } catch (err: any) {
      alert('Errore nell\'importazione del backup: ' + err.message);
    } finally {
      setImportingBackup(false);
    }
  };

  const cleanupOldBackups = async () => {
    if (!confirm('Eliminare i backup più vecchi di 30 giorni?')) {
      return;
    }

    try {
      const deletedCount = await backupService.cleanupOldBackups(30);
      fetchBackups();
      alert(`${deletedCount} backup eliminati con successo!`);
    } catch (err: any) {
      alert('Errore nella pulizia dei backup: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Backup & Recovery</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Nuovo Backup
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Upload size={16} />
            Importa
          </button>
          <button 
            onClick={cleanupOldBackups}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Trash2 size={16} />
            Pulizia
          </button>
          <button 
            onClick={fetchBackups}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            Aggiorna
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Database size={20} color="#3b82f6" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Totale Backup</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937' }}>{stats.total_backups || 0}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BarChart3 size={20} color="#059669" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Dimensione Totale</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
            {formatSize(stats.total_size || 0)}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={20} color="#d97706" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Ultimo Backup</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#d97706' }}>
            {stats.newest_backup ? formatDate(stats.newest_backup.timestamp) : 'Nessuno'}
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={20} color="#dc2626" />
            <span style={{ fontSize: 14, color: '#6b7280' }}>Backup più Vecchio</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
            {stats.oldest_backup ? formatDate(stats.oldest_backup.timestamp) : 'Nessuno'}
          </div>
        </div>
      </div>

      {/* Backups Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Caricamento backup...</p>
        </div>
      ) : error ? (
        <p style={{ color: '#dc2626' }}>{error}</p>
      ) : backups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: 8 }}>
          <Database size={48} color="#6b7280" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Nessun backup trovato</h3>
          <p style={{ color: '#9ca3af' }}>Crea il tuo primo backup per iniziare</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Descrizione</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Dati</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Data</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Dimensione</th>
                <th style={{ padding: 12, borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{backup.name}</div>
                    <small style={{ color: '#6b7280' }}>ID: {backup.id}</small>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ color: '#374151' }}>{backup.description}</div>
                    <small style={{ color: '#6b7280' }}>Creato da: {backup.metadata.created_by}</small>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {backup.metadata.total_clients > 0 && (
                        <span style={{ 
                          background: '#dbeafe', 
                          color: '#2563eb', 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          fontSize: 12 
                        }}>
                          {backup.metadata.total_clients} Clienti
                        </span>
                      )}
                      {backup.metadata.total_investments > 0 && (
                        <span style={{ 
                          background: '#fef3c7', 
                          color: '#d97706', 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          fontSize: 12 
                        }}>
                          {backup.metadata.total_investments} Investments
                        </span>
                      )}
                      {backup.metadata.total_notifications > 0 && (
                        <span style={{ 
                          background: '#f0fdf4', 
                          color: '#16a34a', 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          fontSize: 12 
                        }}>
                          {backup.metadata.total_notifications} Notifications
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <small style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {formatDate(backup.timestamp)}
                    </small>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontWeight: 600 }}>
                      {formatSize(JSON.stringify(backup).length)}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { setSelectedBackup(backup); setShowModal(true); }}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Eye size={12} />
                        Dettagli
                      </button>
                      <button
                        onClick={() => exportBackup(backup.id)}
                        style={{
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Download size={12} />
                        Esporta
                      </button>
                      <button
                        onClick={() => { setSelectedBackup(backup); setShowRestoreModal(true); }}
                        style={{
                          background: '#d97706',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <RefreshCw size={12} />
                        Ripristina
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Trash2 size={12} />
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal per dettagli backup */}
      {showModal && selectedBackup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Dettagli Backup</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3>Informazioni Base</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Nome:</strong> {selectedBackup.name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>ID:</strong> {selectedBackup.id}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Descrizione:</strong> {selectedBackup.description}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Data Creazione:</strong> {formatDate(selectedBackup.timestamp)}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Creato da:</strong> {selectedBackup.metadata.created_by}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Versione:</strong> {selectedBackup.metadata.version}
                </div>
              </div>
              
              <div>
                <h3>Contenuto Backup</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Clienti:</strong> {selectedBackup.metadata.total_clients}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Investimenti:</strong> {selectedBackup.metadata.total_investments}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Notifiche:</strong> {selectedBackup.metadata.total_notifications}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Dimensione:</strong> {formatSize(JSON.stringify(selectedBackup).length)}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <h3>Dati Backup (Anteprima)</h3>
              <pre style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: 8,
                overflow: 'auto',
                fontSize: 12,
                border: '1px solid #e5e7eb',
                maxHeight: 300
              }}>
                {JSON.stringify(selectedBackup.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal per creare backup */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 500,
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Crea Nuovo Backup</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Nome Backup *
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Es: Backup completo sistema"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 4
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Descrizione
              </label>
              <textarea
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                placeholder="Descrizione del backup..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 4,
                  minHeight: 80,
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Opzioni Backup
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={backupOptions.include_clients}
                    onChange={(e) => setBackupOptions(prev => ({ ...prev, include_clients: e.target.checked }))}
                  />
                  Includi Clienti
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={backupOptions.include_investments}
                    onChange={(e) => setBackupOptions(prev => ({ ...prev, include_investments: e.target.checked }))}
                  />
                  Includi Investimenti
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={backupOptions.include_notifications}
                    onChange={(e) => setBackupOptions(prev => ({ ...prev, include_notifications: e.target.checked }))}
                  />
                  Includi Notifiche
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Annulla
              </button>
              <button
                onClick={createBackup}
                disabled={creatingBackup}
                style={{
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: creatingBackup ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {creatingBackup ? 'Creazione...' : 'Crea Backup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per ripristino */}
      {showRestoreModal && selectedBackup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 500,
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowRestoreModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Ripristina Backup</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Backup:</strong> {selectedBackup.name}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Opzioni Ripristino
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={restoreOptions.overwrite_existing}
                    onChange={(e) => setRestoreOptions(prev => ({ ...prev, overwrite_existing: e.target.checked }))}
                  />
                  Sovrascrivi dati esistenti
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={restoreOptions.validate_data}
                    onChange={(e) => setRestoreOptions(prev => ({ ...prev, validate_data: e.target.checked }))}
                  />
                  Valida dati prima del ripristino
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={restoreOptions.create_backup_before_restore}
                    onChange={(e) => setRestoreOptions(prev => ({ ...prev, create_backup_before_restore: e.target.checked }))}
                  />
                  Crea backup prima del ripristino
                </label>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRestoreModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Annulla
              </button>
              <button
                onClick={() => restoreBackup(selectedBackup.id)}
                disabled={restoringBackup}
                style={{
                  background: '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: restoringBackup ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {restoringBackup ? 'Ripristino...' : 'Ripristina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal per importazione */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 500,
            width: '90%',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowImportModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            
            <h2 style={{ marginBottom: '1.5rem' }}>Importa Backup</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                File Backup (.json)
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: 4
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Annulla
              </button>
              <button
                onClick={importBackup}
                disabled={importingBackup || !importFile}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '0.75rem 1.5rem',
                  cursor: importingBackup || !importFile ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {importingBackup ? 'Importazione...' : 'Importa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 