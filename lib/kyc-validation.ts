// KYC Validation System
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 validation score
}

export interface KYCDocumentValidation {
  documentType: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  confidence: number; // 0-100 confidence score
}

export interface PersonalInfoValidation {
  firstName: boolean;
  lastName: boolean;
  dateOfBirth: boolean;
  nationality: boolean;
  address: boolean;
  city: boolean;
  country: boolean;
  phone: boolean;
  email: boolean;
  codiceFiscale?: boolean;
}

export interface FinancialProfileValidation {
  employmentStatus: boolean;
  annualIncome: boolean;
  sourceOfFunds: boolean;
  investmentExperience: boolean;
  riskTolerance: boolean;
  investmentGoals: boolean;
}

// Validazione Codice Fiscale italiano
export function validateCodiceFiscale(cf: string): boolean {
  if (!cf || cf.length !== 16) return false;
  
  // Controllo formato: 6 lettere + 2 numeri + 1 lettera + 2 numeri + 1 lettera + 3 numeri + 1 lettera
  const cfRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  if (!cfRegex.test(cf.toUpperCase())) return false;
  
  // Algoritmo di validazione del codice fiscale
  const evenChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const oddChars = 'BAKPLCQDREVOSFTGUHMINJWZYX1234567890';
  const controlChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const char = cf[i].toUpperCase();
    if (i % 2 === 0) {
      // Caratteri dispari
      sum += oddChars.indexOf(char);
    } else {
      // Caratteri pari
      sum += evenChars.indexOf(char);
    }
  }
  
  const controlChar = controlChars[sum % 26];
  return controlChar === cf[15].toUpperCase();
}

// Validazione email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validazione telefono
export function validatePhone(phone: string): boolean {
  // Rimuovi spazi, trattini e parentesi
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Controlla se inizia con + o 00 per numeri internazionali
  if (cleanPhone.startsWith('+') || cleanPhone.startsWith('00')) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }
  
  // Per numeri italiani
  if (cleanPhone.startsWith('39') || cleanPhone.startsWith('0039')) {
    return cleanPhone.length === 12 || cleanPhone.length === 14;
  }
  
  // Per numeri locali
  return cleanPhone.length >= 8 && cleanPhone.length <= 12;
}

// Validazione età minima (18 anni)
export function validateAge(dateOfBirth: string): boolean {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

// Validazione reddito annuale
export function validateAnnualIncome(income: string): boolean {
  const numIncome = parseFloat(income.replace(/[^\d.]/g, ''));
  return !isNaN(numIncome) && numIncome > 0 && numIncome <= 10000000; // Max 10M
}

// Validazione documento di identità
export function validateIdDocument(documentUrl: string | null): KYCDocumentValidation {
  const result: KYCDocumentValidation = {
    documentType: 'ID_DOCUMENT',
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0
  };

  if (!documentUrl) {
    result.errors.push('Documento di identità richiesto');
    return result;
  }

  // Controlli base
  if (!documentUrl.startsWith('http')) {
    result.errors.push('URL documento non valido');
    return result;
  }

  // Estrai estensione file
  const extension = documentUrl.split('.').pop()?.toLowerCase();
  if (!extension || !['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
    result.errors.push('Formato file non supportato. Usa JPG, PNG o PDF');
    return result;
  }

  // Controlli avanzati (simulati)
  result.isValid = true;
  result.confidence = 85; // Simula analisi AI del documento
  
  // Aggiungi warning se necessario
  if (extension === 'pdf') {
    result.warnings.push('Per una migliore verifica, si consiglia di caricare un\'immagine');
  }

  return result;
}

// Validazione prova di residenza
export function validateProofOfAddress(documentUrl: string | null): KYCDocumentValidation {
  const result: KYCDocumentValidation = {
    documentType: 'PROOF_OF_ADDRESS',
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0
  };

  if (!documentUrl) {
    result.errors.push('Prova di residenza richiesta');
    return result;
  }

  // Controlli base
  if (!documentUrl.startsWith('http')) {
    result.errors.push('URL documento non valido');
    return result;
  }

  const extension = documentUrl.split('.').pop()?.toLowerCase();
  if (!extension || !['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
    result.errors.push('Formato file non supportato. Usa JPG, PNG o PDF');
    return result;
  }

  result.isValid = true;
  result.confidence = 80;

  return result;
}

// Validazione estratto conto bancario
export function validateBankStatement(documentUrl: string | null): KYCDocumentValidation {
  const result: KYCDocumentValidation = {
    documentType: 'BANK_STATEMENT',
    isValid: false,
    errors: [],
    warnings: [],
    confidence: 0
  };

  if (!documentUrl) {
    result.errors.push('Estratto conto bancario richiesto');
    return result;
  }

  if (!documentUrl.startsWith('http')) {
    result.errors.push('URL documento non valido');
    return result;
  }

  const extension = documentUrl.split('.').pop()?.toLowerCase();
  if (!extension || !['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
    result.errors.push('Formato file non supportato. Usa JPG, PNG o PDF');
    return result;
  }

  result.isValid = true;
  result.confidence = 75;

  return result;
}

// Validazione informazioni personali
export function validatePersonalInfo(personalInfo: any): PersonalInfoValidation {
  return {
    firstName: !!personalInfo.firstName && personalInfo.firstName.length >= 2,
    lastName: !!personalInfo.lastName && personalInfo.lastName.length >= 2,
    dateOfBirth: !!personalInfo.dateOfBirth && validateAge(personalInfo.dateOfBirth),
    nationality: !!personalInfo.nationality && personalInfo.nationality.length >= 2,
    address: !!personalInfo.address && personalInfo.address.length >= 10,
    city: !!personalInfo.city && personalInfo.city.length >= 2,
    country: !!personalInfo.country && personalInfo.country.length >= 2,
    phone: !!personalInfo.phone && validatePhone(personalInfo.phone),
    email: !!personalInfo.email && validateEmail(personalInfo.email),
    codiceFiscale: personalInfo.nationality?.toLowerCase() === 'italia' ? 
      validateCodiceFiscale(personalInfo.codiceFiscale || '') : true
  };
}

// Validazione profilo finanziario
export function validateFinancialProfile(financialProfile: any): FinancialProfileValidation {
  return {
    employmentStatus: !!financialProfile.employmentStatus,
    annualIncome: !!financialProfile.annualIncome && validateAnnualIncome(financialProfile.annualIncome),
    sourceOfFunds: !!financialProfile.sourceOfFunds,
    investmentExperience: !!financialProfile.investmentExperience,
    riskTolerance: !!financialProfile.riskTolerance,
    investmentGoals: !!financialProfile.investmentGoals && financialProfile.investmentGoals.length > 0
  };
}

// Validazione completa KYC
export function validateKYC(kycData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Validazione informazioni personali
  const personalInfoValidation = validatePersonalInfo(kycData.personalInfo);
  
  if (!personalInfoValidation.firstName) {
    errors.push('Nome non valido');
    score -= 10;
  }
  if (!personalInfoValidation.lastName) {
    errors.push('Cognome non valido');
    score -= 10;
  }
  if (!personalInfoValidation.dateOfBirth) {
    errors.push('Data di nascita non valida o età inferiore a 18 anni');
    score -= 15;
  }
  if (!personalInfoValidation.nationality) {
    errors.push('Nazionalità non valida');
    score -= 5;
  }
  if (!personalInfoValidation.address) {
    errors.push('Indirizzo troppo breve');
    score -= 5;
  }
  if (!personalInfoValidation.city) {
    errors.push('Città non valida');
    score -= 5;
  }
  if (!personalInfoValidation.country) {
    errors.push('Paese non valido');
    score -= 5;
  }
  if (!personalInfoValidation.phone) {
    errors.push('Numero di telefono non valido');
    score -= 10;
  }
  if (!personalInfoValidation.email) {
    errors.push('Email non valida');
    score -= 10;
  }
  if (kycData.personalInfo.nationality?.toLowerCase() === 'italia' && !personalInfoValidation.codiceFiscale) {
    errors.push('Codice Fiscale italiano non valido');
    score -= 15;
  }

  // Validazione profilo finanziario
  const financialValidation = validateFinancialProfile(kycData.financialProfile);
  
  if (!financialValidation.employmentStatus) {
    errors.push('Stato occupazionale richiesto');
    score -= 5;
  }
  if (!financialValidation.annualIncome) {
    errors.push('Reddito annuale non valido');
    score -= 10;
  }
  if (!financialValidation.sourceOfFunds) {
    errors.push('Fonte dei fondi richiesta');
    score -= 5;
  }
  if (!financialValidation.investmentExperience) {
    errors.push('Esperienza di investimento richiesta');
    score -= 5;
  }
  if (!financialValidation.riskTolerance) {
    errors.push('Tolleranza al rischio richiesta');
    score -= 5;
  }
  if (!financialValidation.investmentGoals) {
    errors.push('Obiettivi di investimento richiesti');
    score -= 5;
  }

  // Validazione documenti
  const idDocValidation = validateIdDocument(kycData.documents.idDocument);
  const addressDocValidation = validateProofOfAddress(kycData.documents.proofOfAddress);
  const bankDocValidation = validateBankStatement(kycData.documents.bankStatement);

  if (!idDocValidation.isValid) {
    errors.push(...idDocValidation.errors);
    score -= 15;
  }
  if (!addressDocValidation.isValid) {
    errors.push(...addressDocValidation.errors);
    score -= 10;
  }
  if (!bankDocValidation.isValid) {
    errors.push(...bankDocValidation.errors);
    score -= 10;
  }

  // Aggiungi warning dai documenti
  warnings.push(...idDocValidation.warnings);
  warnings.push(...addressDocValidation.warnings);
  warnings.push(...bankDocValidation.warnings);

  // Controlli aggiuntivi
  if (score < 70) {
    warnings.push('Punteggio di validazione basso. Si consiglia di verificare tutti i dati inseriti.');
  }

  // Controllo coerenza dati
  if (kycData.personalInfo.nationality?.toLowerCase() === 'italia' && 
      kycData.personalInfo.country?.toLowerCase() !== 'italia') {
    warnings.push('Nazionalità italiana selezionata ma paese diverso dall\'Italia');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, score)
  };
}

// Funzione per generare report di validazione
export function generateValidationReport(validationResult: ValidationResult): string {
  let report = `=== REPORT VALIDAZIONE KYC ===\n\n`;
  report += `Punteggio: ${validationResult.score}/100\n`;
  report += `Stato: ${validationResult.isValid ? 'VALIDO' : 'NON VALIDO'}\n\n`;

  if (validationResult.errors.length > 0) {
    report += `ERRORI (${validationResult.errors.length}):\n`;
    validationResult.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
    report += '\n';
  }

  if (validationResult.warnings.length > 0) {
    report += `AVVISI (${validationResult.warnings.length}):\n`;
    validationResult.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
    report += '\n';
  }

  if (validationResult.isValid) {
    report += '✅ KYC pronto per la revisione\n';
  } else {
    report += '❌ KYC richiede correzioni prima della revisione\n';
  }

  return report;
} 