import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { leerSesion, panelConfigurado } from '@/lib/panel/sesion';
import FormularioIngreso from './FormularioIngreso';

export default async function LoginPanel() {
  await connection();
  if (await leerSesion()) redirect('/data');
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#dde5ea] p-8">
        <p className="text-xs uppercase tracking-wider text-[#017FA7] font-medium">Entrena con Ciencia</p>
        <h1 className="text-2xl font-medium mt-1 mb-6">Panel privado</h1>
        {panelConfigurado() ? (
          <FormularioIngreso />
        ) : (
          <p className="text-sm text-[#4a5a66]">
            Falta configurar el panel en Vercel: agrega las variables <code>PANEL_PASSWORD</code> y{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> y vuelve a desplegar.
          </p>
        )}
      </div>
    </main>
  );
}
