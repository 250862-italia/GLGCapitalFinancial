// Backup and Recovery Service for KYC Data
export interface BackupData {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  data: {
    clients: any[];
    kyc_records: any[];
    audit_trail: any[];
  };
  metadata: {
    version: string;
    total_clients: number;
    total_kyc_records: number;
    total_audit_events: number;
    created_by: string;
  };
}

export interface BackupOptions {
  include_clients?: boolean;
  include_kyc_records?: boolean;
  include_audit_trail?: boolean;
  compress?: boolean;
  encrypt?: boolean;
}

export interface RestoreOptions {
  overwrite_existing?: boolean;
  validate_data?: boolean;
  create_backup_before_restore?: boolean;
}

// Backup Service
export class BackupService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Create a new backup
  async createBackup(
    name: string, 
    description: string, 
    options: BackupOptions = {},
    createdBy: string = 'system'
  ): Promise<BackupData> {
    try {
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      const data: any = {};
      const metadata: any = {
        version: '1.0.0',
        total_clients: 0,
        total_kyc_records: 0,
        total_audit_events: 0,
        created_by: createdBy
      };

      // Backup clients if requested
      if (options.include_clients !== false) {
        const { data: clients, error: clientsError } = await this.supabase
          .from('clients')
          .select('*');
        
        if (clientsError) throw clientsError;
        data.clients = clients || [];
        metadata.total_clients = data.clients.length;
      }

      // Backup KYC records if requested
      if (options.include_kyc_records !== false) {
        const { data: kycRecords, error: kycError } = await this.supabase
          .from('kyc_records')
          .select('*');
        
        if (kycError) throw kycError;
        data.kyc_records = kycRecords || [];
        metadata.total_kyc_records = data.kyc_records.length;
      }

      // Backup audit trail if requested
      if (options.include_audit_trail !== false) {
        const { data: auditTrail, error: auditError } = await this.supabase
          .from('audit_trail')
          .select('*');
        
        if (auditError) throw auditError;
        data.audit_trail = auditTrail || [];
        metadata.total_audit_events = data.audit_trail.length;
      }

      const backup: BackupData = {
        id: backupId,
        name,
        description,
        timestamp,
        data,
        metadata
      };

      // Store backup in database
      const { error: storeError } = await this.supabase
        .from('backups')
        .insert({
          id: backupId,
          name,
          description,
          timestamp,
          data: JSON.stringify(data),
          metadata: JSON.stringify(metadata)
        });

      if (storeError) throw storeError;

      return backup;
    } catch (error) {
      console.error('Backup creation failed:', error);
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  // Get all backups
  async getBackups(): Promise<BackupData[]> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map((backup: any) => ({
        id: backup.id,
        name: backup.name,
        description: backup.description,
        timestamp: backup.timestamp,
        data: JSON.parse(backup.data),
        metadata: JSON.parse(backup.metadata)
      }));
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      throw new Error(`Failed to fetch backups: ${error}`);
    }
  }

  // Get specific backup
  async getBackup(backupId: string): Promise<BackupData | null> {
    try {
      const { data, error } = await this.supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        timestamp: data.timestamp,
        data: JSON.parse(data.data),
        metadata: JSON.parse(data.metadata)
      };
    } catch (error) {
      console.error('Failed to fetch backup:', error);
      throw new Error(`Failed to fetch backup: ${error}`);
    }
  }

  // Restore from backup
  async restoreBackup(
    backupId: string, 
    options: RestoreOptions = {}
  ): Promise<void> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Create backup before restore if requested
      if (options.create_backup_before_restore) {
        await this.createBackup(
          `pre_restore_backup_${Date.now()}`,
          `Backup created before restoring ${backup.name}`,
          { include_clients: true, include_kyc_records: true, include_audit_trail: true },
          'system'
        );
      }

      // Validate data if requested
      if (options.validate_data) {
        const validationResult = this.validateBackupData(backup.data);
        if (!validationResult.isValid) {
          throw new Error(`Backup data validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // Restore clients
      if (backup.data.clients && backup.data.clients.length > 0) {
        if (options.overwrite_existing) {
          // Clear existing clients
          await this.supabase.from('clients').delete().neq('id', '');
        }
        
        // Insert clients from backup
        const { error: clientsError } = await this.supabase
          .from('clients')
          .upsert(backup.data.clients, { onConflict: 'id' });
        
        if (clientsError) throw clientsError;
      }

      // Restore KYC records
      if (backup.data.kyc_records && backup.data.kyc_records.length > 0) {
        if (options.overwrite_existing) {
          // Clear existing KYC records
          await this.supabase.from('kyc_records').delete().neq('id', '');
        }
        
        // Insert KYC records from backup
        const { error: kycError } = await this.supabase
          .from('kyc_records')
          .upsert(backup.data.kyc_records, { onConflict: 'id' });
        
        if (kycError) throw kycError;
      }

      // Restore audit trail
      if (backup.data.audit_trail && backup.data.audit_trail.length > 0) {
        if (options.overwrite_existing) {
          // Clear existing audit trail
          await this.supabase.from('audit_trail').delete().neq('id', '');
        }
        
        // Insert audit trail from backup
        const { error: auditError } = await this.supabase
          .from('audit_trail')
          .upsert(backup.data.audit_trail, { onConflict: 'id' });
        
        if (auditError) throw auditError;
      }

      console.log(`Successfully restored backup: ${backup.name}`);
    } catch (error) {
      console.error('Backup restoration failed:', error);
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }

  // Delete backup
  async deleteBackup(backupId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('backups')
        .delete()
        .eq('id', backupId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw new Error(`Failed to delete backup: ${error}`);
    }
  }

  // Export backup to file
  async exportBackup(backupId: string): Promise<string> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw new Error(`Failed to export backup: ${error}`);
    }
  }

  // Import backup from file
  async importBackup(backupData: string): Promise<BackupData> {
    try {
      const backup: BackupData = JSON.parse(backupData);
      
      // Validate backup structure
      if (!backup.id || !backup.name || !backup.data) {
        throw new Error('Invalid backup format');
      }

      // Store imported backup
      const { error } = await this.supabase
        .from('backups')
        .insert({
          id: backup.id,
          name: backup.name,
          description: backup.description,
          timestamp: backup.timestamp,
          data: JSON.stringify(backup.data),
          metadata: JSON.stringify(backup.metadata)
        });

      if (error) throw error;

      return backup;
    } catch (error) {
      console.error('Failed to import backup:', error);
      throw new Error(`Failed to import backup: ${error}`);
    }
  }

  // Validate backup data
  validateBackupData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate clients data
    if (data.clients) {
      if (!Array.isArray(data.clients)) {
        errors.push('Clients data must be an array');
      } else {
        data.clients.forEach((client: any, index: number) => {
          if (!client.id) errors.push(`Client at index ${index} missing ID`);
          if (!client.email) errors.push(`Client at index ${index} missing email`);
        });
      }
    }

    // Validate KYC records data
    if (data.kyc_records) {
      if (!Array.isArray(data.kyc_records)) {
        errors.push('KYC records data must be an array');
      } else {
        data.kyc_records.forEach((record: any, index: number) => {
          if (!record.id) errors.push(`KYC record at index ${index} missing ID`);
          if (!record.client_id) errors.push(`KYC record at index ${index} missing client_id`);
        });
      }
    }

    // Validate audit trail data
    if (data.audit_trail) {
      if (!Array.isArray(data.audit_trail)) {
        errors.push('Audit trail data must be an array');
      } else {
        data.audit_trail.forEach((event: any, index: number) => {
          if (!event.id) errors.push(`Audit event at index ${index} missing ID`);
          if (!event.action) errors.push(`Audit event at index ${index} missing action`);
          if (!event.timestamp) errors.push(`Audit event at index ${index} missing timestamp`);
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get backup statistics
  async getBackupStatistics(): Promise<any> {
    try {
      const backups = await this.getBackups();
      
      const stats = {
        total_backups: backups.length,
        total_size: 0,
        oldest_backup: null as BackupData | null,
        newest_backup: null as BackupData | null,
        by_month: {} as Record<string, number>
      };

      if (backups.length > 0) {
        stats.oldest_backup = backups[backups.length - 1];
        stats.newest_backup = backups[0];

        backups.forEach(backup => {
          // Calculate size (approximate)
          const size = JSON.stringify(backup).length;
          stats.total_size += size;

          // Count by month
          const month = backup.timestamp.substring(0, 7); // YYYY-MM
          stats.by_month[month] = (stats.by_month[month] || 0) + 1;
        });
      }

      return stats;
    } catch (error) {
      console.error('Failed to get backup statistics:', error);
      throw new Error(`Failed to get backup statistics: ${error}`);
    }
  }

  // Clean up old backups
  async cleanupOldBackups(keepDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);

      const { data: oldBackups, error } = await this.supabase
        .from('backups')
        .select('id')
        .lt('timestamp', cutoffDate.toISOString());

      if (error) throw error;

      const deletedCount = oldBackups?.length || 0;

      if (deletedCount > 0) {
        const { error: deleteError } = await this.supabase
          .from('backups')
          .delete()
          .lt('timestamp', cutoffDate.toISOString());

        if (deleteError) throw deleteError;
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      throw new Error(`Failed to cleanup old backups: ${error}`);
    }
  }
}

// Create backup service instance
export const createBackupService = (supabase: any): BackupService => {
  return new BackupService(supabase);
}; 