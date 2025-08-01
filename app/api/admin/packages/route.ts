import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPackagesWithFallback } from '@/lib/supabase-fallback';
import { getPackages, createPackage, updatePackage, deletePackage, syncPackages } from '@/lib/packages-storage';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
);

// Semplificata verifica admin
async function verifyAdminAuth(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');
  
  // Token semplificato per accesso admin
  if (adminToken === 'admin-access') {
    return { success: true, adminId: 'admin' };
  }
  
  return { success: false, error: 'Admin access required' };
}

// GET - Fetch all packages
export async function GET(request: NextRequest) {
  console.log('🔍 Admin packages API called');
  
  try {
    // Usa il sistema di storage locale
    const packages = getPackages();
    console.log('✅ Packages fetched from local storage:', packages.length);
    
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('❌ Error fetching packages:', error);
    return NextResponse.json({ 
      error: 'Errore nel recupero dei pacchetti',
      packages: []
    }, { status: 500 });
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  console.log('🔍 Admin create package API called');
  
  try {
    const body = await request.json();
    const { name, description, min_investment, max_investment, duration_months, expected_return, status, type, risk_level } = body;

    // Validate required fields
    if (!name || !description || !min_investment || !max_investment || !duration_months || !expected_return) {
      return NextResponse.json({ 
        error: 'Tutti i campi sono obbligatori' 
      }, { status: 400 });
    }

    const packageData = {
      name,
      description,
      min_investment: parseFloat(min_investment),
      max_investment: parseFloat(max_investment),
      duration_months: parseInt(duration_months),
      expected_return: parseFloat(expected_return),
      status: status || 'active',
      type: type || 'balanced',
      risk_level: risk_level || 'medium'
    };

    // Crea il pacchetto nel storage locale
    const newPackage = createPackage(packageData);
    
    console.log('✅ Package created successfully in local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Pacchetto creato con successo',
      package: newPackage 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// PUT - Update package
export async function PUT(request: NextRequest) {
  console.log('🔍 Admin update package API called');
  
  try {
    const body = await request.json();
    const { id, name, description, min_investment, max_investment, duration_months, expected_return, status, type, risk_level } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'ID pacchetto richiesto' 
      }, { status: 400 });
    }

    const packageData = {
      name,
      description,
      min_investment: parseFloat(min_investment),
      max_investment: parseFloat(max_investment),
      duration_months: parseInt(duration_months),
      expected_return: parseFloat(expected_return),
      status: status || 'active',
      type: type || 'balanced',
      risk_level: risk_level || 'medium'
    };

    // Aggiorna il pacchetto nel storage locale
    const updatedPackage = updatePackage(id, packageData);
    
    if (!updatedPackage) {
      return NextResponse.json({ 
        error: 'Pacchetto non trovato' 
      }, { status: 404 });
    }

    console.log('✅ Package updated successfully in local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Pacchetto aggiornato con successo',
      package: updatedPackage 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// DELETE - Delete package
export async function DELETE(request: NextRequest) {
  console.log('🔍 Admin delete package API called');
  
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ 
        error: 'ID pacchetto richiesto' 
      }, { status: 400 });
    }

    // Elimina il pacchetto dal storage locale
    const success = deletePackage(id);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Pacchetto non trovato' 
      }, { status: 404 });
    }

    console.log('✅ Package deleted successfully from local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Pacchetto eliminato con successo' 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
} 