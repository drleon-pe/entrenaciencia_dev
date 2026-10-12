'use server';

import { redirect } from 'next/navigation';
import { cerrarSesion, credencialesValidas, crearSesion } from '@/lib/panel/sesion';

export async function ingresar(_estado: string | undefined, formData: FormData): Promise<string | undefined> {
  const correo = String(formData.get('correo') ?? '').trim();
  const clave = String(formData.get('clave') ?? '');
  if (!credencialesValidas(correo, clave)) {
    await new Promise((r) => setTimeout(r, 800)); // frena intentos repetidos
    return 'Correo o contraseña incorrectos.';
  }
  await crearSesion(correo);
  redirect('/data');
}

export async function salir() {
  await cerrarSesion();
  redirect('/data/login');
}
