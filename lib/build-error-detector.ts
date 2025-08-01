// Build Error Detection System for GLG Capital Group
// Proactively identifies and handles webpack and build issues

export interface BuildError {
  type: 'webpack' | 'module' | 'chunk' | 'runtime';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface BuildHealth {
  healthy: boolean;
  errors: BuildError[];
  warnings: string[];
  timestamp: Date;
}

// Detect webpack errors
export const detectWebpackErrors = (): BuildError[] => {
  const errors: BuildError[] = [];
  
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check for Next.js data errors
      if (window.__NEXT_DATA__?.err) {
        errors.push({
          type: 'webpack',
          message: 'Webpack build error detected',
          details: window.__NEXT_DATA__.err,
          timestamp: new Date()
        });
      }
      
      // Check for chunk loading errors
      if (window.__NEXT_DATA__?.buildId === 'development') {
        // Development build might have chunk issues
        console.warn('⚠️ Development build detected - monitoring for chunk errors');
      }
    }
    
    // Check for module resolution errors
    try {
      require.resolve('next');
    } catch (e) {
      errors.push({
        type: 'module',
        message: 'Next.js module not found',
        details: e,
        timestamp: new Date()
      });
    }
    
    // Check for React module
    try {
      require.resolve('react');
    } catch (e) {
      errors.push({
        type: 'module',
        message: 'React module not found',
        details: e,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    errors.push({
      type: 'runtime',
      message: 'Error detection failed',
      details: error,
      timestamp: new Date()
    });
  }
  
  return errors;
};

// Check build health
export const checkBuildHealth = (): BuildHealth => {
  const errors = detectWebpackErrors();
  const warnings: string[] = [];
  
  // Add warnings for potential issues
  if (process.env.NODE_ENV === 'development') {
    warnings.push('Development mode - enhanced error monitoring active');
  }
  
  // Check for common build issues
  if (typeof window !== 'undefined') {
    // Check for missing chunks
    const scripts = document.querySelectorAll('script[src*="chunks"]');
    if (scripts.length === 0) {
      warnings.push('No webpack chunks detected - potential build issue');
    }
  }
  
  return {
    healthy: errors.length === 0,
    errors,
    warnings,
    timestamp: new Date()
  };
};

// Handle build errors gracefully
export const handleBuildErrors = (errors: BuildError[]): void => {
  console.group('🚨 Build Errors Detected');
  
  errors.forEach(error => {
    console.error(`❌ ${error.type.toUpperCase()}: ${error.message}`);
    if (error.details) {
      console.error('Details:', error.details);
    }
  });
  
  console.groupEnd();
  
  // Provide recovery suggestions
  if (errors.length > 0) {
    console.log('💡 Recovery Suggestions:');
    console.log('1. Run: rm -rf .next && npm run dev');
    console.log('2. Run: npm cache clean --force');
    console.log('3. Run: npm install');
    console.log('4. Check for conflicting dependencies');
  }
};

// Monitor build health continuously
export const startBuildMonitoring = (): void => {
  if (typeof window === 'undefined') {
    return; // Server-side only
  }
  
  // Check build health every 30 seconds
  setInterval(() => {
    const health = checkBuildHealth();
    
    if (!health.healthy) {
      console.warn('⚠️ Build health issues detected');
      handleBuildErrors(health.errors);
    }
    
    if (health.warnings.length > 0) {
      console.warn('⚠️ Build warnings:', health.warnings);
    }
  }, 30000);
  
  // Initial check
  const initialHealth = checkBuildHealth();
  if (!initialHealth.healthy) {
    handleBuildErrors(initialHealth.errors);
  }
};

// Enhanced fetch with build error handling
export const safeFetchWithBuildCheck = async <T = any>(
  url: string,
  options: RequestInit = {},
  context: string = 'API Call'
): Promise<{ data: T | null; error: any; buildHealthy: boolean }> => {
  
  // Check build health first
  const buildHealth = checkBuildHealth();
  
  if (!buildHealth.healthy) {
    console.error('🚨 Build errors detected, skipping fetch');
    return {
      data: null,
      error: {
        type: 'BUILD_ERROR',
        message: 'Build errors prevent API calls',
        details: buildHealth.errors
      },
      buildHealthy: false
    };
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      data,
      error: null,
      buildHealthy: true
    };
    
  } catch (error) {
    return {
      data: null,
      error,
      buildHealthy: true
    };
  }
};

// Initialize build monitoring
if (typeof window !== 'undefined') {
  // Start monitoring in browser
  startBuildMonitoring();
} 