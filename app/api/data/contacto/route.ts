import { NextResponse } from 'next/server';
import { leerSesion } from '@/lib/panel/sesion';
import { contactoCompleto } from '@/lib/panel/datos';

// Devuelve el contacto completo de un inscrito, solo cuando se pide desde el panel.
export async function GET(request: Request) {
  const correo = await leerSesion();
  if (!correo) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Id inválido' }, { status: 400 });

  try {
    const contacto = await contactoCompleto(id);
    if (!contacto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    console.info('[panel] contacto visto', { por: correo, id });
    return NextResponse.json(contacto, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('[panel] contacto', e);
    return NextResponse.json({ error: 'No se pudo leer el contacto' }, { status: 500 });
  }
}
