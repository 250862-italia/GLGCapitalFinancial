export interface InvestmentFormData {
  id?: string;
  client_id: string;
  package_id: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  total_returns: number;
  daily_returns: number;
  payment_method: 'bank' | 'usdt';
  notes?: string;
}

export interface Investment {
  id: string;
  // Proprietà camelCase (usate lato frontend se normalizzate)
  packageName?: string;
  amount: number;
  dailyReturn?: number;
  duration?: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'pending' | 'pending_payment';
  totalEarned?: number;
  dailyEarnings?: number;
  monthlyEarnings?: number;

  // Proprietà snake_case (come arrivano dal backend)
  package_name?: string;
  daily_return?: number;
  start_date?: string;
  end_date?: string;
  total_returns?: number;
  daily_returns?: number;
  monthly_earnings?: number;
} 