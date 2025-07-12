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
    try {
      console.log('Initializing local database at:', this.dbPath);
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      console.log('Database connection established');
      
      await this.createTables();
      console.log('Database tables created/verified');
    } catch (error) {
      console.error('Failed to initialize local database:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      console.log('Creating/verifying database tables...');

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
      console.log('Users table ready');

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
      console.log('Clients table ready');

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
      console.log('KYC records table ready');

      // Create simple_kyc table for the new simplified KYC system
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS simple_kyc (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          country TEXT NOT NULL,
          city TEXT,
          address TEXT,
          date_of_birth TEXT,
          nationality TEXT,
          employment_status TEXT,
          annual_income TEXT,
          source_of_funds TEXT,
          investment_experience TEXT,
          risk_tolerance TEXT,
          investment_goals TEXT,
          status TEXT DEFAULT 'pending',
          email_verified INTEGER DEFAULT 0,
          email_verification_code TEXT,
          email_verification_expires TEXT,
          submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TEXT,
          reviewed_by TEXT,
          rejection_reason TEXT,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
      console.log('Simple KYC table ready');

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
      console.log('Investments and notifications tables ready');

      // Create admin user if not exists
      await this.createAdminUser();
      console.log('Admin user check completed');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw new Error(`Table creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM users WHERE email = ?', email);
    return result || null;
  }

  async getUserById(id: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM users WHERE id = ?', id);
    return result || null;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.all('SELECT * FROM users ORDER BY created_at DESC');
  }

  // Client operations
  async createClient(clientData: Partial<Client>): Promise<Client> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const id = this.generateId();

      console.log('Creating client with data:', { id, ...clientData });

      await this.db.run(`
        INSERT INTO clients (id, user_id, company_name, tax_id, address, city, country, postal_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        clientData.user_id,
        clientData.company_name || null,
        clientData.tax_id || null,
        clientData.address || null,
        clientData.city || null,
        clientData.country || null,
        clientData.postal_code || null
      ]);

      const client = await this.getClientById(id);
      if (!client) {
        throw new Error('Failed to retrieve created client');
      }
      
      console.log('Client created successfully:', client);
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error(`Failed to create client record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM clients WHERE id = ?', id);
    return result || null;
  }

  async getClientByUserId(userId: string): Promise<Client | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM clients WHERE user_id = ?', userId);
    return result || null;
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

    const kycRecord = await this.getKYCRecordById(id);
    if (!kycRecord) {
      throw new Error('Failed to create KYC record');
    }
    return kycRecord;
  }

  async getKYCRecordById(id: string): Promise<KYCRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM kyc_records WHERE id = ?', id);
    return result || null;
  }

  async getKYCRecordByUserId(userId: string): Promise<KYCRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM kyc_records WHERE user_id = ?', userId);
    return result || null;
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

  // Simple KYC operations
  async createSimpleKYC(kycData: any): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();

    await this.db.run(`
      INSERT INTO simple_kyc (
        id, user_id, first_name, last_name, email, phone, country, city, address,
        date_of_birth, nationality, employment_status, annual_income, source_of_funds,
        investment_experience, risk_tolerance, investment_goals, status, email_verified,
        email_verification_code, email_verification_expires, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      kycData.user_id,
      kycData.first_name,
      kycData.last_name,
      kycData.email,
      kycData.phone,
      kycData.country,
      kycData.city || null,
      kycData.address || null,
      kycData.date_of_birth || null,
      kycData.nationality || null,
      kycData.employment_status || null,
      kycData.annual_income || null,
      kycData.source_of_funds || null,
      kycData.investment_experience || null,
      kycData.risk_tolerance || null,
      kycData.investment_goals ? JSON.stringify(kycData.investment_goals) : null,
      kycData.status || 'pending',
      kycData.email_verified ? 1 : 0,
      kycData.email_verification_code || null,
      kycData.email_verification_expires || null,
      kycData.submitted_at || new Date().toISOString()
    ]);

    const kycRecord = await this.getSimpleKYCById(id);
    if (!kycRecord) {
      throw new Error('Failed to create simple KYC record');
    }
    return kycRecord;
  }

  async getSimpleKYCById(id: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('SELECT * FROM simple_kyc WHERE id = ?', id);
    if (record) {
      // Parse investment_goals JSON
      if (record.investment_goals) {
        try {
          record.investment_goals = JSON.parse(record.investment_goals);
        } catch (e) {
          record.investment_goals = [];
        }
      }
      // Convert email_verified to boolean
      record.email_verified = Boolean(record.email_verified);
    }
    return record || null;
  }

  async getSimpleKYCByUserId(userId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.db.get('SELECT * FROM simple_kyc WHERE user_id = ?', userId);
    if (record) {
      // Parse investment_goals JSON
      if (record.investment_goals) {
        try {
          record.investment_goals = JSON.parse(record.investment_goals);
        } catch (e) {
          record.investment_goals = [];
        }
      }
      // Convert email_verified to boolean
      record.email_verified = Boolean(record.email_verified);
    }
    return record || null;
  }

  async getAllSimpleKYC(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const records = await this.db.all('SELECT * FROM simple_kyc ORDER BY submitted_at DESC');
    return records.map(record => {
      // Parse investment_goals JSON
      if (record.investment_goals) {
        try {
          record.investment_goals = JSON.parse(record.investment_goals);
        } catch (e) {
          record.investment_goals = [];
        }
      }
      // Convert email_verified to boolean
      record.email_verified = Boolean(record.email_verified);
      return record;
    });
  }

  async updateSimpleKYCStatus(id: string, status: string, reviewedBy?: string, rejectionReason?: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE simple_kyc 
      SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ?, rejection_reason = ?
      WHERE id = ?
    `, [status, reviewedBy || null, rejectionReason || null, id]);
  }

  async verifySimpleKYCEmail(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE simple_kyc 
      SET email_verified = 1, status = 'email_verified', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
  }

  async updateSimpleKYCVerificationCode(id: string, code: string, expiresAt: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(`
      UPDATE simple_kyc 
      SET email_verification_code = ?, email_verification_expires = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [code, expiresAt, id]);
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

    const investment = await this.getInvestmentById(id);
    if (!investment) {
      throw new Error('Failed to create investment');
    }
    return investment;
  }

  async getInvestmentById(id: string): Promise<Investment | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.get('SELECT * FROM investments WHERE id = ?', id);
    return result || null;
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

  async updateInvestment(id: string, fields: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const allowedFields = ['amount', 'currency', 'status', 'investment_type', 'updated_at'];
    const updates = [];
    const values = [];
    for (const key of allowedFields) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return;
    values.push(id);
    await this.db.run(
      `UPDATE investments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async deleteInvestment(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.run('DELETE FROM investments WHERE id = ?', id);
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

    const result = await this.db.get('SELECT * FROM notifications WHERE id = ?', id);
    return result || null;
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