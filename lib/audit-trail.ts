// Audit Trail System for KYC
export interface AuditEvent {
  id?: string;
  user_id: string;
  action: string;
  entity_type: 'kyc_record' | 'client' | 'document';
  entity_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending';
}

export interface AuditFilter {
  user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  severity?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}

// Audit Actions
export const AUDIT_ACTIONS = {
  // KYC Actions
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  KYC_PENDING_REVIEW: 'kyc_pending_review',
  KYC_UPDATED: 'kyc_updated',
  KYC_DOCUMENT_UPLOADED: 'kyc_document_uploaded',
  KYC_DOCUMENT_VERIFIED: 'kyc_document_verified',
  KYC_DOCUMENT_REJECTED: 'kyc_document_rejected',
  
  // Client Actions
  CLIENT_CREATED: 'client_created',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_STATUS_CHANGED: 'client_status_changed',
  
  // Admin Actions
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  ADMIN_ACTION: 'admin_action',
  
  // System Actions
  SYSTEM_ERROR: 'system_error',
  SYSTEM_WARNING: 'system_warning',
  SYSTEM_INFO: 'system_info'
} as const;

// Audit Severity Levels
export const AUDIT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Audit Status
export const AUDIT_STATUS = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  PENDING: 'pending'
} as const;

// Audit Trail Service
export class AuditTrailService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Log an audit event
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEvent: Omit<AuditEvent, 'id'> = {
        ...event,
        timestamp: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('audit_trail')
        .insert(auditEvent);

      if (error) {
        console.error('Audit trail logging failed:', error);
        // Don't throw error to avoid breaking main functionality
      }
    } catch (error) {
      console.error('Audit trail logging error:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Log KYC submission
  async logKYCSubmission(userId: string, kycData: any, validationScore?: number): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: AUDIT_ACTIONS.KYC_SUBMITTED,
      entity_type: 'kyc_record',
      entity_id: `kyc_${userId}_${Date.now()}`,
      details: {
        personal_info: {
          first_name: kycData.personalInfo.firstName,
          last_name: kycData.personalInfo.lastName,
          nationality: kycData.personalInfo.nationality,
          country: kycData.personalInfo.country
        },
        documents_uploaded: {
          id_document: !!kycData.documents.idDocument,
          proof_of_address: !!kycData.documents.proofOfAddress,
          bank_statement: !!kycData.documents.bankStatement
        },
        validation_score: validationScore,
        submission_timestamp: new Date().toISOString()
      },
      severity: AUDIT_SEVERITY.MEDIUM,
      status: AUDIT_STATUS.SUCCESS
    });
  }

  // Log KYC status change
  async logKYCStatusChange(
    adminUserId: string, 
    kycId: string, 
    oldStatus: string, 
    newStatus: string, 
    reason?: string,
    clientEmail?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: adminUserId,
      action: this.getStatusChangeAction(newStatus),
      entity_type: 'kyc_record',
      entity_id: kycId,
      details: {
        old_status: oldStatus,
        new_status: newStatus,
        reason: reason,
        client_email: clientEmail,
        change_timestamp: new Date().toISOString(),
        admin_user_id: adminUserId
      },
      severity: this.getStatusChangeSeverity(newStatus),
      status: AUDIT_STATUS.SUCCESS
    });
  }

  // Log document upload
  async logDocumentUpload(
    userId: string, 
    documentType: string, 
    documentUrl: string, 
    fileSize?: number
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: AUDIT_ACTIONS.KYC_DOCUMENT_UPLOADED,
      entity_type: 'document',
      entity_id: `doc_${userId}_${Date.now()}`,
      details: {
        document_type: documentType,
        document_url: documentUrl,
        file_size: fileSize,
        upload_timestamp: new Date().toISOString()
      },
      severity: AUDIT_SEVERITY.LOW,
      status: AUDIT_STATUS.SUCCESS
    });
  }

  // Log admin action
  async logAdminAction(
    adminUserId: string, 
    action: string, 
    details: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      user_id: adminUserId,
      action: AUDIT_ACTIONS.ADMIN_ACTION,
      entity_type: 'kyc_record',
      entity_id: `admin_${Date.now()}`,
      details: {
        admin_action: action,
        ...details,
        action_timestamp: new Date().toISOString()
      },
      severity: AUDIT_SEVERITY.MEDIUM,
      status: AUDIT_STATUS.SUCCESS
    });
  }

  // Log system error
  async logSystemError(
    error: Error, 
    context: string, 
    userId?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId || 'system',
      action: AUDIT_ACTIONS.SYSTEM_ERROR,
      entity_type: 'kyc_record',
      entity_id: `error_${Date.now()}`,
      details: {
        error_message: error.message,
        error_stack: error.stack,
        context: context,
        error_timestamp: new Date().toISOString()
      },
      severity: AUDIT_SEVERITY.HIGH,
      status: AUDIT_STATUS.FAILURE
    });
  }

  // Get audit events with filters
  async getAuditEvents(filters: AuditFilter = {}, limit = 100, offset = 0): Promise<AuditEvent[]> {
    try {
      let query = this.supabase
        .from('audit_trail')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch audit events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching audit events:', error);
      return [];
    }
  }

  // Get audit events for specific entity
  async getEntityAuditEvents(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return this.getAuditEvents({
      entity_type: entityType,
      entity_id: entityId
    });
  }

  // Get audit events for specific user
  async getUserAuditEvents(userId: string): Promise<AuditEvent[]> {
    return this.getAuditEvents({
      user_id: userId
    });
  }

  // Get audit statistics
  async getAuditStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      let query = this.supabase
        .from('audit_trail')
        .select('action, severity, status, timestamp');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch audit statistics:', error);
        return {};
      }

      const stats = {
        total_events: data?.length || 0,
        by_action: {} as Record<string, number>,
        by_severity: {} as Record<string, number>,
        by_status: {} as Record<string, number>,
        by_day: {} as Record<string, number>
      };

      data?.forEach((event: AuditEvent) => {
        // Count by action
        stats.by_action[event.action] = (stats.by_action[event.action] || 0) + 1;
        
        // Count by severity
        stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;
        
        // Count by status
        stats.by_status[event.status] = (stats.by_status[event.status] || 0) + 1;
        
        // Count by day
        const day = event.timestamp.split('T')[0];
        stats.by_day[day] = (stats.by_day[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      return {};
    }
  }

  // Export audit events to CSV
  async exportAuditEvents(filters: AuditFilter = {}): Promise<string> {
    const events = await this.getAuditEvents(filters, 10000); // Large limit for export

    const csvHeaders = [
      'ID',
      'User ID',
      'Action',
      'Entity Type',
      'Entity ID',
      'Severity',
      'Status',
      'Timestamp',
      'Details'
    ];

    const csvRows = events.map(event => [
      event.id || '',
      event.user_id,
      event.action,
      event.entity_type,
      event.entity_id,
      event.severity,
      event.status,
      event.timestamp,
      JSON.stringify(event.details)
    ]);

    const csv = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }

  // Helper methods
  private getStatusChangeAction(newStatus: string): string {
    switch (newStatus) {
      case 'approved':
        return AUDIT_ACTIONS.KYC_APPROVED;
      case 'rejected':
        return AUDIT_ACTIONS.KYC_REJECTED;
      case 'pending':
        return AUDIT_ACTIONS.KYC_PENDING_REVIEW;
      default:
        return AUDIT_ACTIONS.KYC_UPDATED;
    }
  }

  private getStatusChangeSeverity(newStatus: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (newStatus) {
      case 'approved':
      case 'rejected':
        return AUDIT_SEVERITY.HIGH;
      case 'pending':
        return AUDIT_SEVERITY.MEDIUM;
      default:
        return AUDIT_SEVERITY.LOW;
    }
  }
}

// Create audit trail service instance
export const createAuditTrailService = (supabase: any): AuditTrailService => {
  return new AuditTrailService(supabase);
}; 