'use client';

import { useActionState } from 'react';
import { ingresar } from '../acciones';

export default function FormularioIngreso() {
  const [error, accion, enviando] = useActionState(ingresar, undefined);
  const campo = 'w-full rounded-lg border border-[#cbd6dd] px-3 py-2.5 text-[15px] outline-none focus:border-[#017FA7] focus:ring-2 focus:ring-[#017FA7]/20';
  return (
    <form action={accion} className="space-y-4">
      <label className="block">
        <span className="text-sm text-[#4a5a66]">Correo</span>
        <input name="correo" type="email" required autoComplete="email" className={`${campo} mt-1`} />
      </label>
      <label className="block">
        <span className="text-sm text-[#4a5a66]">Contraseña</span>
        <input name="clave" type="password" required autoComplete="current-password" className={`${campo} mt-1`} />
      </label>
      {error && <p className="text-sm text-[#b42318]">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-[#FFC300] text-[#0A2540] py-2.5 font-extrabold hover:bg-[#FFD230] disabled:opacity-60"
      >
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
