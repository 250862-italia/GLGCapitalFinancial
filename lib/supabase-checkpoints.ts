import { createClient, FunctionRegion } from '@supabase/supabase-js';

// Checkpoint configuration
interface SupabaseCheckpoint {
  name: string;
  url: string;
  anonKey: string;
  region: FunctionRegion;
  priority: number;
  lastCheck: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string) => {
  return process.env[key] || fallback;
};

// Default checkpoints with different regions
const SUPABASE_CHECKPOINTS: SupabaseCheckpoint[] = [
  {
    name: 'Primary (us-east-1)',
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'),
    region: FunctionRegion.UsEast1,
    priority: 1,
    lastCheck: 0,
    status: 'unknown',
    responseTime: 0
  },
  {
    name: 'Fallback (eu-west-3)',
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'),
    region: FunctionRegion.EuWest3,
    priority: 2,
    lastCheck: 0,
    status: 'unknown',
    responseTime: 0
  },
  {
    name: 'Secondary (ap-south-1)',
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'),
    region: FunctionRegion.ApSouth1,
    priority: 3,
    lastCheck: 0,
    status: 'unknown',
    responseTime: 0
  }
];

// Current active checkpoint
let activeCheckpoint: SupabaseCheckpoint | null = null;
let checkpoints = [...SUPABASE_CHECKPOINTS];

// Health check function
async function checkCheckpointHealth(checkpoint: SupabaseCheckpoint): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    const client = createClient(checkpoint.url, checkpoint.anonKey);
    
    // Test connection with a simple query
    const { data, error } = await client.auth.getSession();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.log(`[CHECKPOINT] ${checkpoint.name} (${checkpoint.region}): UNHEALTHY - ${error.message}`);
      checkpoint.status = 'unhealthy';
      checkpoint.responseTime = responseTime;
      checkpoint.lastCheck = Date.now();
      return false;
    }
    
    console.log(`[CHECKPOINT] ${checkpoint.name} (${checkpoint.region}): HEALTHY - ${responseTime}ms`);
    checkpoint.status = 'healthy';
    checkpoint.responseTime = responseTime;
    checkpoint.lastCheck = Date.now();
    return true;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`[CHECKPOINT] ${checkpoint.name} (${checkpoint.region}): UNHEALTHY - ${error}`);
    checkpoint.status = 'unhealthy';
    checkpoint.responseTime = responseTime;
    checkpoint.lastCheck = Date.now();
    return false;
  }
}

// Find the best available checkpoint
async function findBestCheckpoint(): Promise<SupabaseCheckpoint | null> {
  console.log('[CHECKPOINT] Checking all checkpoints...');
  
  // Check all checkpoints in parallel
  const healthChecks = checkpoints.map(async (checkpoint) => {
    const isHealthy = await checkCheckpointHealth(checkpoint);
    return { checkpoint, isHealthy };
  });
  
  const results = await Promise.all(healthChecks);
  
  // Find the first healthy checkpoint by priority
  const healthyCheckpoints = results
    .filter(result => result.isHealthy)
    .map(result => result.checkpoint)
    .sort((a, b) => a.priority - b.priority);
  
  if (healthyCheckpoints.length > 0) {
    const bestCheckpoint = healthyCheckpoints[0];
    console.log(`[CHECKPOINT] Selected: ${bestCheckpoint.name} (${bestCheckpoint.region})`);
    return bestCheckpoint;
  }
  
  console.log('[CHECKPOINT] No healthy checkpoints available');
  return null;
}

// Get or create Supabase client with checkpoint
export async function getSupabaseClient() {
  // If no active checkpoint or it's been more than 5 minutes, check again
  if (!activeCheckpoint || (Date.now() - activeCheckpoint.lastCheck) > 5 * 60 * 1000) {
    activeCheckpoint = await findBestCheckpoint();
  }
  
  if (!activeCheckpoint) {
    throw new Error('No healthy Supabase checkpoints available');
  }
  
  return createClient(activeCheckpoint.url, activeCheckpoint.anonKey);
}

// Get current checkpoint info
export function getCurrentCheckpoint() {
  return activeCheckpoint;
}

// Get all checkpoint statuses
export function getAllCheckpoints() {
  return checkpoints;
}

// Force refresh checkpoints
export async function refreshCheckpoints() {
  console.log('[CHECKPOINT] Force refreshing all checkpoints...');
  activeCheckpoint = null;
  return await findBestCheckpoint();
}

// Add custom checkpoint
export function addCheckpoint(checkpoint: Omit<SupabaseCheckpoint, 'lastCheck' | 'status' | 'responseTime'>) {
  const newCheckpoint: SupabaseCheckpoint = {
    ...checkpoint,
    lastCheck: 0,
    status: 'unknown',
    responseTime: 0
  };
  
  checkpoints.push(newCheckpoint);
  checkpoints.sort((a, b) => a.priority - b.priority);
  
  console.log(`[CHECKPOINT] Added: ${checkpoint.name} (${checkpoint.region})`);
}

// Remove checkpoint
export function removeCheckpoint(name: string) {
  const initialLength = checkpoints.length;
  checkpoints = checkpoints.filter(cp => cp.name !== name);
  
  if (checkpoints.length < initialLength) {
    console.log(`[CHECKPOINT] Removed: ${name}`);
  }
}

// Initialize checkpoints on module load
export async function initializeCheckpoints() {
  console.log('[CHECKPOINT] Initializing Supabase checkpoints...');
  activeCheckpoint = await findBestCheckpoint();
  return activeCheckpoint;
} 