import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// Sesión del panel privado: cookie firmada con HMAC.
// La clave de firma es PANEL_PASSWORD, así que cambiar la contraseña cierra todas las sesiones.

const COOKIE = 'ecc_panel';
const DURACION_MS = 12 * 60 * 60 * 1000; // 12 horas

// Correos autorizados (no son secretos). PANEL_EMAILS en Vercel reemplaza la lista si existe.
const CORREOS_POR_DEFECTO = ['lfontenoy@subecontenido.com', 'gleon@subecontenido.com'];

export function correosAutorizados(): string[] {
  const env = process.env.PANEL_EMAILS;
  const lista = env ? env.split(',') : CORREOS_POR_DEFECTO;
  return lista.map((c) => c.trim().toLowerCase()).filter(Boolean);
}

export function panelConfigurado(): boolean {
  return Boolean(process.env.PANEL_PASSWORD && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function firmar(datos: string): string {
  return createHmac('sha256', process.env.PANEL_PASSWORD ?? '').update(datos).digest('base64url');
}

function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function credencialesValidas(correo: string, clave: string): boolean {
  const esperada = process.env.PANEL_PASSWORD;
  if (!esperada) return false;
  const correoOk = correosAutorizados().includes(correo.trim().toLowerCase());
  // Se compara siempre la clave, aunque el correo no esté autorizado, para no filtrar cuál falló.
  const claveOk = iguales(firmar(clave), firmar(esperada));
  return correoOk && claveOk;
}

export async function crearSesion(correo: string) {
  const vence = Date.now() + DURACION_MS;
  const datos = Buffer.from(JSON.stringify({ c: correo.toLowerCase(), v: vence })).toString('base64url');
  (await cookies()).set(COOKIE, `${datos}.${firmar(datos)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(vence),
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

/** Devuelve el correo de la sesión válida, o null. */
export async function leerSesion(): Promise<string | null> {
  if (!process.env.PANEL_PASSWORD) return null;
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return null;
  const [datos, firma] = valor.split('.');
  if (!datos || !firma || !iguales(firma, firmar(datos))) return null;
  try {
    const { c, v } = JSON.parse(Buffer.from(datos, 'base64url').toString());
    if (typeof v !== 'number' || v < Date.now()) return null;
    if (!correosAutorizados().includes(c)) return null;
    return c;
  } catch {
    return null;
  }
}
