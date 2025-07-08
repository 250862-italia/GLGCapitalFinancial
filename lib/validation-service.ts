interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, data?: any) => boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationSchema {
  [field: string]: ValidationRule[];
}

class ValidationService {
  private schemas: Map<string, ValidationSchema> = new Map();

  constructor() {
    this.initializeDefaultSchemas();
  }

  // Initialize default validation schemas
  private initializeDefaultSchemas(): void {
    // User registration schema
    this.addSchema('userRegistration', {
      email: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' },
        { type: 'maxLength', value: 255, message: 'Email must be less than 255 characters' }
      ],
      password: [
        { type: 'required', message: 'Password is required' },
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
        { type: 'pattern', value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
      ],
      confirmPassword: [
        { type: 'required', message: 'Password confirmation is required' },
        { type: 'custom', message: 'Passwords do not match', 
          validator: (value, data) => value === data.password }
      ],
      first_name: [
        { type: 'required', message: 'First name is required' },
        { type: 'minLength', value: 2, message: 'First name must be at least 2 characters' },
        { type: 'maxLength', value: 50, message: 'First name must be less than 50 characters' },
        { type: 'pattern', value: /^[a-zA-Z\s]+$/, message: 'First name can only contain letters and spaces' }
      ],
      last_name: [
        { type: 'required', message: 'Last name is required' },
        { type: 'minLength', value: 2, message: 'Last name must be at least 2 characters' },
        { type: 'maxLength', value: 50, message: 'Last name must be less than 50 characters' },
        { type: 'pattern', value: /^[a-zA-Z\s]+$/, message: 'Last name can only contain letters and spaces' }
      ],
      phone: [
        { type: 'required', message: 'Phone number is required' },
        { type: 'pattern', value: /^\+?[\d\s\-\(\)]+$/, message: 'Invalid phone number format' }
      ],
      date_of_birth: [
        { type: 'required', message: 'Date of birth is required' },
        { type: 'custom', message: 'Must be at least 18 years old', 
          validator: (value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            return age > 18 || (age === 18 && monthDiff > 0) || (age === 18 && monthDiff === 0 && today.getDate() >= birthDate.getDate());
          }}
      ]
    });

    // Investment schema
    this.addSchema('investment', {
      amount: [
        { type: 'required', message: 'Investment amount is required' },
        { type: 'custom', message: 'Amount must be a positive number', 
          validator: (value) => !isNaN(value) && parseFloat(value) > 0 },
        { type: 'custom', message: 'Amount must be at least $1,000', 
          validator: (value) => parseFloat(value) >= 1000 },
        { type: 'custom', message: 'Amount cannot exceed $1,000,000', 
          validator: (value) => parseFloat(value) <= 1000000 }
      ],
      packageId: [
        { type: 'required', message: 'Investment package is required' },
        { type: 'custom', message: 'Invalid investment package', 
          validator: (value) => ['1', '2', '3'].includes(value) }
      ],
      paymentMethod: [
        { type: 'required', message: 'Payment method is required' },
        { type: 'custom', message: 'Invalid payment method', 
          validator: (value) => ['card', 'bank_transfer', 'crypto'].includes(value) }
      ]
    });

    // KYC schema
    this.addSchema('kyc', {
      nationality: [
        { type: 'required', message: 'Nationality is required' },
        { type: 'custom', message: 'Invalid nationality', 
          validator: (value) => ['US', 'UK', 'IT', 'DE', 'FR', 'CA', 'AU'].includes(value) }
      ],
      address: [
        { type: 'required', message: 'Address is required' },
        { type: 'minLength', value: 10, message: 'Address must be at least 10 characters' },
        { type: 'maxLength', value: 200, message: 'Address must be less than 200 characters' }
      ],
      city: [
        { type: 'required', message: 'City is required' },
        { type: 'minLength', value: 2, message: 'City must be at least 2 characters' },
        { type: 'maxLength', value: 50, message: 'City must be less than 50 characters' }
      ],
      country: [
        { type: 'required', message: 'Country is required' },
        { type: 'custom', message: 'Invalid country', 
          validator: (value) => ['US', 'UK', 'IT', 'DE', 'FR', 'CA', 'AU'].includes(value) }
      ],
      employmentStatus: [
        { type: 'required', message: 'Employment status is required' },
        { type: 'custom', message: 'Invalid employment status', 
          validator: (value) => ['employed', 'self-employed', 'unemployed', 'retired', 'student'].includes(value) }
      ],
      annualIncome: [
        { type: 'required', message: 'Annual income is required' },
        { type: 'custom', message: 'Invalid annual income range', 
          validator: (value) => ['0-25000', '25000-50000', '50000-75000', '75000-100000', '100000-250000', '250000+'].includes(value) }
      ]
    });

    // Payment schema
    this.addSchema('payment', {
      cardNumber: [
        { type: 'required', message: 'Card number is required' },
        { type: 'pattern', value: /^\d{16}$/, message: 'Card number must be 16 digits' },
        { type: 'custom', message: 'Invalid card number (Luhn algorithm check)', 
          validator: (value) => this.validateLuhn(value) }
      ],
      expiryMonth: [
        { type: 'required', message: 'Expiry month is required' },
        { type: 'custom', message: 'Invalid expiry month', 
          validator: (value) => {
            const month = parseInt(value);
            return month >= 1 && month <= 12;
          }}
      ],
      expiryYear: [
        { type: 'required', message: 'Expiry year is required' },
        { type: 'custom', message: 'Invalid expiry year', 
          validator: (value) => {
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            return year >= currentYear && year <= currentYear + 10;
          }}
      ],
      cvv: [
        { type: 'required', message: 'CVV is required' },
        { type: 'pattern', value: /^\d{3,4}$/, message: 'CVV must be 3 or 4 digits' }
      ],
      holderName: [
        { type: 'required', message: 'Card holder name is required' },
        { type: 'minLength', value: 2, message: 'Card holder name must be at least 2 characters' },
        { type: 'maxLength', value: 100, message: 'Card holder name must be less than 100 characters' },
        { type: 'pattern', value: /^[a-zA-Z\s]+$/, message: 'Card holder name can only contain letters and spaces' }
      ]
    });
  }

  // Add a validation schema
  addSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
    console.log(`📋 Validation schema added: ${name}`);
  }

  // Validate data against a schema
  validate(data: any, schemaName: string): ValidationResult {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Validation schema '${schemaName}' not found`);
    }

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      for (const rule of rules) {
        const isValid = this.validateRule(rule, value, data);
        
        if (!isValid) {
          result.isValid = false;
          result.errors.push(`${field}: ${rule.message}`);
        }
      }
    }

    return result;
  }

  // Validate a single rule
  private validateRule(rule: ValidationRule, value: any, data?: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);

      case 'minLength':
        return value && value.length >= rule.value;

      case 'maxLength':
        return !value || value.length <= rule.value;

      case 'pattern':
        return rule.value.test(value);

      case 'custom':
        return rule.validator ? rule.validator(value, data) : true;

      default:
        return true;
    }
  }

  // Validate specific field types
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    if (password.length < 12) {
      warnings.push('Consider using a longer password for better security');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  validateAmount(amount: number | string): ValidationResult {
    const errors: string[] = [];
    const numAmount = parseFloat(amount.toString());

    if (isNaN(numAmount)) {
      errors.push('Amount must be a valid number');
    } else if (numAmount <= 0) {
      errors.push('Amount must be greater than 0');
    } else if (numAmount < 1000) {
      errors.push('Amount must be at least $1,000');
    } else if (numAmount > 1000000) {
      errors.push('Amount cannot exceed $1,000,000');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  validateAge(birthDate: string | Date): ValidationResult {
    const errors: string[] = [];
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    const actualAge = age > 18 || (age === 18 && monthDiff > 0) || 
                     (age === 18 && monthDiff === 0 && today.getDate() >= birth.getDate()) ? age : age - 1;

    if (actualAge < 18) {
      errors.push('Must be at least 18 years old');
    } else if (actualAge > 100) {
      errors.push('Invalid birth date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  // Validate Luhn algorithm for credit card numbers
  private validateLuhn(cardNumber: string): boolean {
    if (!/^\d+$/.test(cardNumber)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Sanitize input data
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validate and sanitize user input
  validateAndSanitize(data: any, schemaName: string): { data: any; result: ValidationResult } {
    const sanitizedData: any = {};

    // Sanitize string inputs
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitizedData[key] = this.sanitizeInput(value);
      } else {
        sanitizedData[key] = value;
      }
    }

    const result = this.validate(sanitizedData, schemaName);

    return {
      data: sanitizedData,
      result
    };
  }

  // Get validation schema
  getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name);
  }

  // List all available schemas
  getAvailableSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }
}

// Export singleton instance
export const validationService = new ValidationService();

// Export types
export type { ValidationRule, ValidationResult, ValidationSchema }; 