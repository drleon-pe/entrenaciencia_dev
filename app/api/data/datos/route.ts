import { NextResponse } from 'next/server';
import { leerSesion } from '@/lib/panel/sesion';
import { leerPanel } from '@/lib/panel/datos';

export async function GET(request: Request) {
  if (!(await leerSesion())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const url = new URL(request.url);
  const desde = url.searchParams.get('desde');
  const hasta = url.searchParams.get('hasta');
  if (!desde || !hasta || isNaN(Date.parse(desde)) || isNaN(Date.parse(hasta))) {
    return NextResponse.json({ error: 'Rango de fechas inválido' }, { status: 400 });
  }
  try {
    const datos = await leerPanel({ desde, hasta, incluirEquipo: url.searchParams.get('equipo') === '1' });
    return NextResponse.json(datos, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[panel] datos', e);
    return NextResponse.json({ error: 'No se pudieron leer los datos' }, { status: 500 });
  }
}
