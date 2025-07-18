import { NextRequest, NextResponse } from 'next/server';
import { globalPerformanceMonitor, getPrometheusMetrics } from '@/lib/performance-monitor';

// GET /api/performance - Ottieni metriche delle performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const operation = searchParams.get('operation');

    // Controlla se richiesto formato Prometheus
    if (format === 'prometheus') {
      const prometheusMetrics = getPrometheusMetrics();
      return new NextResponse(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Ottieni metriche
    let metrics;
    if (operation) {
      metrics = globalPerformanceMonitor.getMetrics(operation);
    } else {
      metrics = globalPerformanceMonitor.getFullReport();
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Performance-Monitor': 'active'
      }
    });

  } catch (error) {
    console.error('❌ Errore API performance:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// POST /api/performance/reset - Resetta le metriche
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'reset') {
      globalPerformanceMonitor.reset();
      
      return NextResponse.json({
        success: true,
        message: 'Metriche delle performance resettate con successo',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Azione non valida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Errore reset performance:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 