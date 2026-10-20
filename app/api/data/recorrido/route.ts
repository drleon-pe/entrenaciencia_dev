import { NextResponse } from 'next/server';
import { leerSesion } from '@/lib/panel/sesion';
import { recorridoInscrito } from '@/lib/panel/datos';

export async function GET(request: Request) {
  if (!(await leerSesion())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 });
  try {
    const r = await recorridoInscrito(id);
    if (!r) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(r, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[panel] recorrido', e);
    return NextResponse.json({ error: 'No se pudo leer el recorrido' }, { status: 500 });
  }
}
