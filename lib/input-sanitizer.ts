// Input Sanitization Utility
// Prevents XSS, SQL Injection, Unicode attacks, and other injection attacks

export class InputSanitizer {
  // Remove all Unicode control characters and dangerous sequences
  private static removeUnicodeControlChars(input: string): string {
    return input
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters (0x00-0x1F, 0x7F)
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Remove Unicode control characters
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Remove directional formatting characters
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
      // Remove object replacement and replacement characters
      .replace(/[\uFFFC\uFFFD]/g, '')
      // Remove private use area characters
      .replace(/[\uE000-\uF8FF]/g, '')
      // Remove variation selectors
      .replace(/[\uFE00-\uFE0F]/g, '')
      // Remove variation selector supplements
      .replace(/[\uDB40-\uDB43][\uDC00-\uDFFF]/g, '')
      // Remove combining characters that could be used for attacks
      .replace(/[\u0300-\u036F]/g, '');
  }

  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(input);
    
    // HTML entity encoding
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Additional dangerous patterns
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script/gi, '')
      .replace(/<iframe/gi, '')
      .replace(/<object/gi, '')
      .replace(/<embed/gi, '')
      .replace(/<form/gi, '')
      .replace(/<input/gi, '')
      .replace(/<textarea/gi, '')
      .replace(/<select/gi, '')
      .replace(/<button/gi, '')
      .replace(/<link/gi, '')
      .replace(/<meta/gi, '')
      .replace(/<style/gi, '')
      .replace(/<title/gi, '')
      .replace(/<head/gi, '')
      .replace(/<body/gi, '')
      .replace(/<html/gi, '');
    
    return sanitized.substring(0, 1000); // Limit length
  }

  // Sanitize email address with strict validation
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(email.trim().toLowerCase());
    
    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      return '';
    }
    
    // Additional checks
    if (sanitized.length > 254) return ''; // RFC 5321 limit
    if (sanitized.includes('..')) return ''; // No consecutive dots
    if (sanitized.startsWith('.') || sanitized.endsWith('.')) return '';
    
    return sanitized;
  }

  // Sanitize name fields with strict validation
  static sanitizeName(name: string): string {
    if (!name || typeof name !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(name.trim());
    
    // Remove dangerous patterns
    sanitized = sanitized
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/[&]/g, '&amp;') // Escape ampersands
      .replace(/["']/g, '') // Remove quotes
      .replace(/[{}]/g, '') // Remove braces
      .replace(/[\[\]]/g, '') // Remove brackets
      .replace(/[()]/g, '') // Remove parentheses
      .replace(/[;]/g, '') // Remove semicolons
      .replace(/[=]/g, '') // Remove equals
      .replace(/[`]/g, '') // Remove backticks
      .replace(/[\\]/g, '') // Remove backslashes
      .replace(/[|]/g, '') // Remove pipes
      .replace(/[~]/g, '') // Remove tildes
      .replace(/[!]/g, '') // Remove exclamation marks
      .replace(/[@]/g, '') // Remove at symbols
      .replace(/[#]/g, '') // Remove hash symbols
      .replace(/[$]/g, '') // Remove dollar signs
      .replace(/[%]/g, '') // Remove percent signs
      .replace(/[\^]/g, '') // Remove carets
      .replace(/[&]/g, '') // Remove ampersands
      .replace(/[*]/g, '') // Remove asterisks
      .replace(/[+]/g, '') // Remove plus signs
      .replace(/[,]/g, '') // Remove commas
      .replace(/[.]/g, '') // Remove dots
      .replace(/[/]/g, '') // Remove forward slashes
      .replace(/[?]/g, '') // Remove question marks
      .replace(/[0-9]/g, '') // Remove numbers
      .replace(/[A-Z]/g, '') // Remove uppercase letters
      .replace(/[a-z]/g, '') // Remove lowercase letters
      .replace(/[\s]/g, '') // Remove whitespace
      .replace(/[^\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g, ''); // Only allow specific Unicode ranges for names
    
    return sanitized.substring(0, 50); // Limit length
  }

  // Sanitize phone number with strict validation
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(phone.trim());
    
    // Keep only valid phone characters
    sanitized = sanitized.replace(/[^\d+\-\(\)\s]/g, '');
    
    // Remove dangerous patterns
    sanitized = sanitized
      .replace(/[<>]/g, '')
      .replace(/[&]/g, '')
      .replace(/["']/g, '')
      .replace(/[{}]/g, '')
      .replace(/[\[\]]/g, '')
      .replace(/[;]/g, '')
      .replace(/[=]/g, '')
      .replace(/[`]/g, '')
      .replace(/[\\]/g, '')
      .replace(/[|]/g, '')
      .replace(/[~]/g, '')
      .replace(/[!]/g, '')
      .replace(/[@]/g, '')
      .replace(/[#]/g, '')
      .replace(/[$]/g, '')
      .replace(/[%]/g, '')
      .replace(/[\^]/g, '')
      .replace(/[*]/g, '')
      .replace(/[+]/g, '')
      .replace(/[,]/g, '')
      .replace(/[.]/g, '')
      .replace(/[/]/g, '')
      .replace(/[?]/g, '');
    
    return sanitized.substring(0, 20); // Limit length
  }

  // Sanitize country/city names with strict validation
  static sanitizeLocation(location: string): string {
    if (!location || typeof location !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(location.trim());
    
    // Remove dangerous patterns
    sanitized = sanitized
      .replace(/[<>]/g, '')
      .replace(/[&]/g, '&amp;')
      .replace(/["']/g, '')
      .replace(/[{}]/g, '')
      .replace(/[\[\]]/g, '')
      .replace(/[()]/g, '')
      .replace(/[;]/g, '')
      .replace(/[=]/g, '')
      .replace(/[`]/g, '')
      .replace(/[\\]/g, '')
      .replace(/[|]/g, '')
      .replace(/[~]/g, '')
      .replace(/[!]/g, '')
      .replace(/[@]/g, '')
      .replace(/[#]/g, '')
      .replace(/[$]/g, '')
      .replace(/[%]/g, '')
      .replace(/[\^]/g, '')
      .replace(/[*]/g, '')
      .replace(/[+]/g, '')
      .replace(/[,]/g, '')
      .replace(/[.]/g, '')
      .replace(/[/]/g, '')
      .replace(/[?]/g, '')
      .replace(/[0-9]/g, '')
      .replace(/[A-Z]/g, '')
      .replace(/[a-z]/g, '')
      .replace(/[\s]/g, '')
      .replace(/[^\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g, '');
    
    return sanitized.substring(0, 50); // Limit length
  }

  // Sanitize text content with strict validation
  static sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(text.trim());
    
    // Remove dangerous patterns
    sanitized = sanitized
      .replace(/[<>]/g, '')
      .replace(/[&]/g, '&amp;')
      .replace(/["']/g, '')
      .replace(/[{}]/g, '')
      .replace(/[\[\]]/g, '')
      .replace(/[()]/g, '')
      .replace(/[;]/g, '')
      .replace(/[=]/g, '')
      .replace(/[`]/g, '')
      .replace(/[\\]/g, '')
      .replace(/[|]/g, '')
      .replace(/[~]/g, '')
      .replace(/[!]/g, '')
      .replace(/[@]/g, '')
      .replace(/[#]/g, '')
      .replace(/[$]/g, '')
      .replace(/[%]/g, '')
      .replace(/[\^]/g, '')
      .replace(/[*]/g, '')
      .replace(/[+]/g, '')
      .replace(/[,]/g, '')
      .replace(/[.]/g, '')
      .replace(/[/]/g, '')
      .replace(/[?]/g, '')
      .replace(/[0-9]/g, '')
      .replace(/[A-Z]/g, '')
      .replace(/[a-z]/g, '')
      .replace(/[\s]/g, '')
      .replace(/[^\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g, '');
    
    return sanitized.substring(0, 1000); // Limit length
  }

  // Sanitize numeric input with strict validation
  static sanitizeNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    // Remove all non-numeric characters except decimal point and minus
    const sanitized = String(value).replace(/[^\d.-]/g, '');
    
    const num = Number(sanitized);
    
    // Check for valid number
    if (isNaN(num) || !isFinite(num)) return null;
    
    // Limit to reasonable range
    if (num < -999999999 || num > 999999999) return null;
    
    return num;
  }

  // Sanitize URL with strict validation
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    let sanitized = this.removeUnicodeControlChars(url.trim());
    
    // Remove dangerous protocols
    sanitized = sanitized
      .replace(/^javascript:/gi, '')
      .replace(/^vbscript:/gi, '')
      .replace(/^data:/gi, '')
      .replace(/^file:/gi, '')
      .replace(/^ftp:/gi, '')
      .replace(/^gopher:/gi, '')
      .replace(/^mailto:/gi, '')
      .replace(/^news:/gi, '')
      .replace(/^telnet:/gi, '');
    
    // Basic URL validation
    try {
      const urlObj = new URL(sanitized);
      // Only allow http and https
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return '';
      }
      return sanitized;
    } catch {
      return '';
    }
  }

  // Sanitize form data object with strict validation
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
          case 'address':
          case 'postal_code':
            sanitized[key] = this.sanitizeLocation(value);
            break;
          case 'message':
          case 'description':
          case 'notes':
          case 'company':
          case 'position':
          case 'employer_name':
          case 'job_title':
          case 'nationality':
          case 'tax_residency':
          case 'source_of_funds':
          case 'investment_experience':
          case 'risk_tolerance':
          case 'employment_status':
            sanitized[key] = this.sanitizeText(value);
            break;
          case 'url':
          case 'website':
          case 'profile_photo':
          case 'usdt_wallet':
            sanitized[key] = this.sanitizeUrl(value);
            break;
          case 'iban':
          case 'bic':
          case 'account_holder':
            sanitized[key] = this.sanitizeText(value);
            break;
          case 'date_of_birth':
            // Validate date format
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              sanitized[key] = '';
            } else {
              sanitized[key] = date.toISOString().split('T')[0];
            }
            break;
          default:
            sanitized[key] = this.sanitizeHtml(value);
        }
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeNumber(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeFormData(value);
      } else {
        sanitized[key] = value; // Keep other types as-is
      }
    }
    
    return sanitized;
  }

  // Validate and sanitize registration data with strict validation
  static sanitizeRegistrationData(data: any) {
    const sanitized = this.sanitizeFormData(data);
    
    // Additional validation
    if (!sanitized.email) {
      throw new Error('Email is required and must be valid');
    }
    
    if (!sanitized.firstName || !sanitized.lastName) {
      throw new Error('First name and last name are required');
    }
    
    if (sanitized.password && sanitized.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Validate password strength
    if (sanitized.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(sanitized.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    }
    
    return sanitized;
  }

  // Validate and sanitize login data with strict validation
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

  // Validate and sanitize profile update data
  static sanitizeProfileData(data: any) {
    const sanitized = this.sanitizeFormData(data);
    
    // Validate required fields
    if (!sanitized.first_name) {
      throw new Error('First name is required');
    }
    
    if (!sanitized.last_name) {
      throw new Error('Last name is required');
    }
    
    if (!sanitized.email) {
      throw new Error('Email is required');
    }
    
    return sanitized;
  }
} 