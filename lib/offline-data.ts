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