export interface InvestmentFormData {
  id?: string;
  clientId: string;
  packageId: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  totalReturns: number;
  dailyReturns: number;
  paymentMethod: 'bank' | 'usdt';
  notes?: string;
} 