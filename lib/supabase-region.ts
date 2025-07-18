import { FunctionRegion } from '@supabase/supabase-js';

const REGION_MAP: Record<string, FunctionRegion> = {
  'ApNortheast1': FunctionRegion.ApNortheast1,
  'ApNortheast2': FunctionRegion.ApNortheast2,
  'ApSouth1': FunctionRegion.ApSouth1,
  'ApSoutheast1': FunctionRegion.ApSoutheast1,
  'ApSoutheast2': FunctionRegion.ApSoutheast2,
  'CaCentral1': FunctionRegion.CaCentral1,
  'UsEast1': FunctionRegion.UsEast1,
  'UsWest1': FunctionRegion.UsWest1,
  'UsWest2': FunctionRegion.UsWest2,
  'EuCentral1': FunctionRegion.EuCentral1,
  'EuWest1': FunctionRegion.EuWest1,
  'EuWest2': FunctionRegion.EuWest2,
  'EuWest3': FunctionRegion.EuWest3,
  'SaEast1': FunctionRegion.SaEast1,
};

export function getSupabaseFunctionRegion(): FunctionRegion | undefined {
  const env = process.env.SUPABASE_FUNCTION_REGION;
  if (!env) return undefined;
  return REGION_MAP[env] || undefined;
} 