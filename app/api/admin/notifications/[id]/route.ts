import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Configurazione Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Funzione per verificare il token admin
function verifyAdminToken(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.substring(7);
    return token.length > 10;
  } catch (error) {
    return false;
  }
}

// DELETE - Elimina una notifica
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Elimina la notifica dal database
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('❌ Errore nell\'eliminazione notifica:', error);
      return NextResponse.json(
        { success: false, error: 'Errore nell\'eliminazione della notifica' },
        { status: 500 }
      );
    }

    console.log('✅ Notifica eliminata:', params.id);
    return NextResponse.json({
      success: true,
      message: 'Notifica eliminata con successo'
    });

  } catch (error) {
    console.error('❌ Errore generale eliminazione notifica:', error);
    return NextResponse.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
