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

export interface Investment {
  id: string;
  packageName: string;
  amount: number;
  dailyReturn: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending' | 'pending_payment';
  totalEarned: number;
  dailyEarnings: number;
  monthlyEarnings: number;
} 