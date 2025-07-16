// Input Sanitization Utility
// Prevents XSS, SQL Injection, and other injection attacks

export class InputSanitizer {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Sanitize email address
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    // Basic email validation and sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // Sanitize name fields
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    return name
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/["']/g, '') // Remove quotes
      .substring(0, 100); // Limit length
  }

  // Sanitize phone number
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    
    return phone
      .replace(/[^\d+\-\(\)\s]/g, '') // Keep only digits, +, -, (, ), spaces
      .trim()
      .substring(0, 20); // Limit length
  }

  // Sanitize country/city names
  static sanitizeLocation(location: string): string {
    if (!location || typeof location !== 'string') return '';
    
    return location
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/["']/g, '') // Remove quotes
      .substring(0, 50); // Limit length
  }

  // Sanitize text content (for messages, descriptions, etc.)
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/["']/g, '') // Remove quotes
      .substring(0, 1000); // Limit length
  }

  // Sanitize numeric input
  static sanitizeNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // Sanitize URL
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    const sanitized = url.trim();
    
    // Basic URL validation
    try {
      new URL(sanitized);
      return sanitized;
    } catch {
      return '';
    }
  }

  // Sanitize form data object
  static sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        switch (key.toLowerCase()) {
          case 'email':
            sanitized[key] = this.sanitizeEmail(value);
            break;
          case 'first_name':
          case 'last_name':
          case 'name':
            sanitized[key] = this.sanitizeName(value);
            break;
          case 'phone':
            sanitized[key] = this.sanitizePhone(value);
            break;
          case 'country':
          case 'city':
            sanitized[key] = this.sanitizeLocation(value);
            break;
          case 'message':
          case 'description':
          case 'notes':
            sanitized[key] = this.sanitizeText(value);
            break;
          case 'url':
          case 'website':
            sanitized[key] = this.sanitizeUrl(value);
            break;
          default:
            sanitized[key] = this.sanitizeHtml(value);
        }
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeNumber(value);
      } else {
        sanitized[key] = value; // Keep other types as-is
      }
    }
    
    return sanitized;
  }

  // Validate and sanitize registration data
  static sanitizeRegistrationData(data: any) {
    const sanitized = this.sanitizeFormData(data);
    
    // Additional validation
    if (!sanitized.email) {
      throw new Error('Email is required and must be valid');
    }
    
    if (!sanitized.firstName || !sanitized.lastName) {
      throw new Error('First name and last name are required');
    }
    
    if (sanitized.password && sanitized.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    return sanitized;
  }

  // Validate and sanitize login data
  static sanitizeLoginData(data: any) {
    const sanitized = this.sanitizeFormData(data);
    
    if (!sanitized.email) {
      throw new Error('Email is required');
    }
    
    if (!sanitized.password) {
      throw new Error('Password is required');
    }
    
    return sanitized;
  }
} 