export interface Activity {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  type: 'user' | 'position' | 'content' | 'data' | 'team' | 'investment' | 'kyc' | 'payment' | 'system';
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreateData {
  user_id?: string;
  admin_id?: string;
  action: string;
  type: Activity['type'];
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivityFilters {
  type?: Activity['type'];
  user_id?: string;
  admin_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
} 