import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { leerSesion, panelConfigurado } from '@/lib/panel/sesion';
import { VERSIONES_PANEL } from '@/lib/panel/datos';
import Tablero from './Tablero';

export default async function Panel() {
  await connection(); // siempre en cada visita: el acceso se revisa en el servidor
  if (!panelConfigurado()) redirect('/data/login');
  const correo = await leerSesion();
  if (!correo) redirect('/data/login');
  return <Tablero correo={correo} versiones={VERSIONES_PANEL} />;
}
