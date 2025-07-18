// Offline data manager for fallback when Supabase is unavailable
import { fallbackData } from './fallback-data';

class OfflineDataManager {
  private data = fallbackData;

  getClients() {
    return this.data.clients || [];
  }

  getUsers() {
    return this.data.users || [];
  }

  getInvestments() {
    return this.data.investments || [];
  }

  getPackages() {
    return this.data.packages || [];
  }

  getTeam() {
    return this.data.team || [];
  }

  getContent() {
    return this.data.content || [];
  }

  getPartnerships() {
    return this.data.partnerships || [];
  }

  getSettings() {
    return this.data.settings || {};
  }

  getAnalytics() {
    return this.data.analytics || {};
  }

  // Dashboard overview method
  getDashboardOverview() {
    const totalUsers = this.data.users?.length || 0;
    const activeUsers = this.data.users?.filter(user => user.is_active).length || 0;
    const totalInvestments = this.data.investments?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
    const totalRevenue = totalInvestments * 0.1; // 10% revenue assumption

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalInvestments,
        totalRevenue,
        userGrowth: 12.5,
        revenueGrowth: 8.3
      },
      recentActivity: this.data.investments?.slice(-5) || [],
      topClients: this.data.clients?.slice(-3) || []
    };
  }

  // Helper method to get data by key
  getData(key: keyof typeof fallbackData) {
    return this.data[key];
  }

  // Method to update data (useful for testing)
  updateData(key: keyof typeof fallbackData, newData: any) {
    this.data[key] = newData;
  }

  // Method to reset data to original fallback data
  resetData() {
    this.data = { ...fallbackData };
  }
}

export const offlineDataManager = new OfflineDataManager(); 