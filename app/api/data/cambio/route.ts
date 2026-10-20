import { NextResponse } from 'next/server';
import { leerSesion } from '@/lib/panel/sesion';
import { leerCambio, type Fuente } from '@/lib/panel/datos';

export async function GET(request: Request) {
  if (!(await leerSesion())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const url = new URL(request.url);
  try {
    const f = url.searchParams.get('fuente');
    const fuente: Fuente = f === 'meta' || f === 'tiktok' ? f : 'todo';
    const datos = await leerCambio({ incluirEquipo: url.searchParams.get('equipo') === '1', fuente });
    return NextResponse.json(datos, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[panel] cambio', e);
    return NextResponse.json({ error: 'No se pudieron leer los datos' }, { status: 500 });
  }
}
