import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { leerSesion, panelConfigurado } from '@/lib/panel/sesion';
import FormularioIngreso from './FormularioIngreso';

export default async function LoginPanel() {
  await connection();
  if (await leerSesion()) redirect('/data');
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#0A2540] bg-[radial-gradient(900px_520px_at_85%_-10%,rgba(35,211,255,.18),transparent_70%)]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_24px_60px_-24px_rgba(1,13,21,.6)] p-8">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/isotipo-teal.png" alt="" width={44} height={44} className="w-11 h-11" />
          <p className="text-[13px] uppercase tracking-[.14em] font-extrabold leading-tight text-[#0A2540]">
            Entrena <span className="block text-[#017FA7]">con Ciencia</span>
          </p>
        </div>
        <h1 className="text-2xl font-medium mt-5 mb-6 text-[#0A2540]">Panel privado</h1>
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
