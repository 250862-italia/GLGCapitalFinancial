import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  user_id: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

interface KYCRecord {
  id: string;
  user_id: string;
  status: string;
  document_type?: string;
  document_url?: string;
  verification_data?: any;
  created_at: string;
  updated_at: string;
}

interface Investment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  investment_type?: string;
  created_at: string;
  updated_at: string;
}

class LocalDatabase {
  private db: Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = process.env.LOCAL_DATABASE_PATH || './local-database.sqlite';
  }

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clients table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT,
        tax_id TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        postal_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create kyc_records table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS kyc_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        document_type TEXT,
        document_url TEXT,
        verification_data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create investments table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS investments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        status TEXT DEFAULT 'pending',
        investment_type TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'unread',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create admin user if not exists
    await this.createAdminUser();
  }

  private async createAdminUser(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const adminExists = await this.db.get(
      'SELECT id FROM users WHERE email = ?',
      'admin@glgcapital.com'
    );

    if (!adminExists) {
      const passwordHash = await bcrypt.hash('Admin123!@#', 10);
      await this.db.run(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        this.generateId(),
        'admin@glgcapital.com',
        passwordHash,
        'Admin',
        'GLG Capital',
        'admin'
      ]);
    }
  }

  private generateId(): string {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const passwordHash = await bcrypt.hash(userData.password_hash!, 10);

    await this.db.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userData.email,
      passwordHash,
      userData.first_name,
      userData.last_name,
      userData.phone,
      userData.role || 'user'
    ]);

    return this.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM users WHERE email = ?', email);
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM users WHERE id = ?', id);
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM users ORDER BY created_at DESC');
  }

  // Client operations
  async createClient(clientData: Partial<Client>): Promise<Client> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    await this.db.run(`
      INSERT INTO clients (id, user_id, company_name, tax_id, address, city, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      clientData.user_id,
      clientData.company_name,
      clientData.tax_id,
      clientData.address,
      clientData.city,
      clientData.country,
      clientData.postal_code
    ]);

    return this.getClientById(id);
  }

  async getClientById(id: string): Promise<Client | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM clients WHERE id = ?', id);
  }

  async getClientByUserId(userId: string): Promise<Client | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM clients WHERE user_id = ?', userId);
  }

  async getAllClients(): Promise<Client[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM clients ORDER BY created_at DESC');
  }

  // KYC operations
  async createKYCRecord(kycData: Partial<KYCRecord>): Promise<KYCRecord> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    await this.db.run(`
      INSERT INTO kyc_records (id, user_id, status, document_type, document_url, verification_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      kycData.user_id,
      kycData.status || 'pending',
      kycData.document_type,
      kycData.document_url,
      kycData.verification_data ? JSON.stringify(kycData.verification_data) : null
    ]);

    return this.getKYCRecordById(id);
  }

  async getKYCRecordById(id: string): Promise<KYCRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM kyc_records WHERE id = ?', id);
  }

  async getKYCRecordByUserId(userId: string): Promise<KYCRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM kyc_records WHERE user_id = ?', userId);
  }

  async getAllKYCRecords(): Promise<KYCRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM kyc_records ORDER BY created_at DESC');
  }

  async updateKYCStatus(id: string, status: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE kyc_records 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);
  }

  // Investment operations
  async createInvestment(investmentData: Partial<Investment>): Promise<Investment> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    await this.db.run(`
      INSERT INTO investments (id, user_id, amount, currency, status, investment_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      id,
      investmentData.user_id,
      investmentData.amount,
      investmentData.currency || 'EUR',
      investmentData.status || 'pending',
      investmentData.investment_type
    ]);

    return this.getInvestmentById(id);
  }

  async getInvestmentById(id: string): Promise<Investment | null> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('SELECT * FROM investments WHERE id = ?', id);
  }

  async getInvestmentsByUserId(userId: string): Promise<Investment[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM investments WHERE user_id = ? ORDER BY created_at DESC', userId);
  }

  async getAllInvestments(): Promise<Investment[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM investments ORDER BY created_at DESC');
  }

  async updateInvestmentStatus(id: string, status: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE investments 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);
  }

  // Notification operations
  async createNotification(notificationData: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    status: string;
    created_at: string;
    updated_at: string;
    metadata?: any;
  }): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    await this.db.run(`
      INSERT INTO notifications (id, user_id, type, title, message, status, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      notificationData.user_id,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.status,
      notificationData.created_at,
      notificationData.updated_at,
      notificationData.metadata ? JSON.stringify(notificationData.metadata) : null
    ]);

    return this.getNotificationById(id);
  }

  async getNotificationById(id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.get('SELECT * FROM notifications WHERE id = ?', id);
  }

  async getNotificationsByUserId(userId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', userId);
  }

  async updateNotificationStatus(id: string, status: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE notifications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE notifications 
      SET status = 'read', updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND status = 'unread'
    `, [userId]);
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let localDb: LocalDatabase | null = null;

export async function getLocalDatabase(): Promise<LocalDatabase> {
  if (!localDb) {
    localDb = new LocalDatabase();
    await localDb.init();
  }
  return localDb;
}

export default LocalDatabase; 