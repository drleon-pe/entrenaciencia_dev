'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DatosPanel } from '@/lib/panel/datos';
import { salir } from './acciones';

type Version = { id: string; nombre: string; desde: string };
type Periodo = { id: string; nombre: string; desde: string; hasta: string };

const CADA_MS = 15_000;
const FUTURO = '2100-01-01T00:00:00Z';

function inicioDiaLima(diasAtras = 0): string {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const d = new Date(`${hoy}T00:00:00-05:00`);
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString();
}

function periodos(versiones: Version[]): Periodo[] {
  const lista: Periodo[] = versiones
    .map((v, i) => ({
      id: v.id,
      nombre: `${i === versiones.length - 1 ? 'Versión actual' : 'Versión anterior'}: ${v.nombre}`,
      desde: new Date(v.desde).toISOString(),
      hasta: versiones[i + 1] ? new Date(versiones[i + 1].desde).toISOString() : FUTURO,
    }))
    .reverse();
  return [
    ...lista,
    { id: 'hoy', nombre: 'Hoy', desde: inicioDiaLima(0), hasta: FUTURO },
    { id: '7d', nombre: 'Últimos 7 días', desde: inicioDiaLima(6), hasta: FUTURO },
    { id: 'todo', nombre: 'Todo', desde: new Date(versiones[0].desde).toISOString(), hasta: FUTURO },
  ];
}

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' });
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const diaCorto = (ymd: string) =>
  new Date(`${ymd}T12:00:00-05:00`).toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric' });

function Tarjeta({ titulo, valor, nota }: { titulo: string; valor: string; nota?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#e1e8ec] px-4 py-3">
      <p className="text-[13px] text-[#5b6b76]">{titulo}</p>
      <p className="text-2xl font-medium mt-0.5 tabular-nums">{valor}</p>
      {nota && <p className="text-xs text-[#7a8a95] mt-0.5">{nota}</p>}
    </div>
  );
}

function Seccion({ titulo, children, extra }: { titulo: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-[#e1e8ec] p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-base font-medium">{titulo}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

function Lista({ titulo, filas, total }: { titulo: string; filas: { nombre: string; n: number }[]; total: number }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-[#5b6b76] mb-2">{titulo}</p>
      <ul className="space-y-1.5">
        {filas.slice(0, 6).map((f) => (
          <li key={f.nombre} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="truncate">{f.nombre}</span>
              <span className="tabular-nums text-[#5b6b76]">
                {f.n} · {total ? Math.round((f.n / total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 rounded bg-[#eef3f6] mt-1">
              <div className="h-1.5 rounded bg-[#017FA7]" style={{ width: `${total ? (f.n / total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
        {!filas.length && <li className="text-sm text-[#7a8a95]">Sin datos</li>}
      </ul>
    </div>
  );
}

export default function Tablero({ correo, versiones }: { correo: string; versiones: Version[] }) {
  const opciones = useMemo(() => periodos(versiones), [versiones]);
  const [periodoId, setPeriodoId] = useState(opciones[0].id);
  const [incluirEquipo, setIncluirEquipo] = useState(false);
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [revelados, setRevelados] = useState<Record<string, { name: string; email: string; whatsapp: string; whatsapp_country_code: string }>>({});
  const [nuevos, setNuevos] = useState<Set<string>>(new Set());
  const vistos = useRef<Set<string> | null>(null);

  const periodo = opciones.find((p) => p.id === periodoId)!;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const q = new URLSearchParams({ desde: periodo.desde, hasta: periodo.hasta, equipo: incluirEquipo ? '1' : '0' });
      const r = await fetch(`/api/data/datos?${q}`, { cache: 'no-store' });
      if (r.status === 401) {
        window.location.href = '/data/login';
        return;
      }
      if (!r.ok) throw new Error((await r.json()).error ?? 'Error');
      const d: DatosPanel = await r.json();
      // Resaltar inscritos que llegaron desde la última actualización
      const ids = new Set(d.inscritos.map((i) => i.id));
      if (vistos.current) {
        const llegaron = [...ids].filter((id) => !vistos.current!.has(id));
        if (llegaron.length) {
          setNuevos(new Set(llegaron));
          document.title = `(${llegaron.length}) Nuevo inscrito · Panel`;
        }
      }
      vistos.current = ids;
      setDatos(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCargando(false);
    }
  }, [periodo.desde, periodo.hasta, incluirEquipo]);

  useEffect(() => {
    vistos.current = null;
    cargar();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') cargar();
    }, CADA_MS);
    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        document.title = 'Panel · Entrena con Ciencia';
        cargar();
      }
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  async function revelar(id: string) {
    const r = await fetch(`/api/data/contacto?id=${id}`, { cache: 'no-store' });
    if (r.ok) {
      const c = await r.json();
      setRevelados((prev) => ({ ...prev, [id]: c }));
    }
  }

  const k = datos?.kpis;
  const maxDia = Math.max(1, ...(datos?.porDia.map((d) => d.visitantes) ?? [1]));
  const totalVisitantes = k?.visitantes ?? 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#017FA7] font-medium">Entrena con Ciencia · /vsl</p>
          <h1 className="text-2xl font-medium">Panel de la landing</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 text-[#3b4b56]">
            <span className={`inline-block w-2 h-2 rounded-full ${error ? 'bg-[#d03b3b]' : 'bg-[#0ca30c]'} ${cargando ? 'animate-pulse' : ''}`} />
            {error ? 'Sin conexión' : datos ? `En vivo · ${hora(datos.generado)}` : 'Cargando…'}
          </span>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[#017FA7] hover:underline">
            Vercel Analytics ↗
          </a>
          <span className="text-[#7a8a95] hidden sm:inline">{correo}</span>
          <form action={salir}>
            <button className="rounded-lg border border-[#cbd6dd] px-3 py-1.5 hover:bg-white">Salir</button>
          </form>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={periodoId}
          onChange={(e) => setPeriodoId(e.target.value)}
          className="rounded-lg border border-[#cbd6dd] bg-white px-3 py-2 text-sm"
          aria-label="Periodo"
        >
          {opciones.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[#3b4b56]">
          <input type="checkbox" checked={incluirEquipo} onChange={(e) => setIncluirEquipo(e.target.checked)} />
          Incluir al equipo y el link de demo
        </label>
        {k && !incluirEquipo && k.excluidos > 0 && (
          <span className="text-xs text-[#7a8a95]">{k.excluidos} navegadores del equipo excluidos</span>
        )}
      </div>

      {error && <p className="text-sm text-[#b42318]">No se pudieron cargar los datos: {error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Tarjeta titulo="Visitantes" valor={k ? String(k.visitantes) : '–'} nota="navegadores únicos" />
        <Tarjeta titulo="Visitas" valor={k ? String(k.visitas) : '–'} />
        <Tarjeta titulo="Sesiones" valor={k ? String(k.sesiones) : '–'} />
        <Tarjeta titulo="Inscritos" valor={k ? String(k.inscritos) : '–'} nota="lista de espera" />
        <Tarjeta titulo="Tasa de inscripción" valor={k ? `${k.tasaInscripcion}%` : '–'} nota="inscritos / visitantes" />
        <Tarjeta titulo="Tiempo mediano" valor={k?.tiempoMediano != null ? `${k.tiempoMediano} s` : '–'} nota="por sesión" />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <Seccion titulo="Embudo">
            <ul className="space-y-2.5">
              {datos?.embudo.map((p, i) => {
                const anterior = i > 0 ? datos.embudo[i - 1].n : null;
                const perdida = anterior ? Math.round(((anterior - p.n) / anterior) * 100) : null;
                const destacado = p.nombre === 'Se inscribieron';
                return (
                  <li key={p.nombre}>
                    <div className="flex justify-between text-sm mb-1 gap-2">
                      <span className={destacado ? 'font-medium' : ''}>{p.nombre}</span>
                      <span className="tabular-nums text-[#3b4b56]">
                        <b className="font-medium">{p.n}</b> · {p.pct}%
                        {perdida != null && perdida > 0 && i <= 4 && (
                          <span className="text-[#b54708] ml-2 text-xs">−{perdida}%</span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 rounded bg-[#eef3f6]">
                      <div
                        className={`h-3 rounded ${destacado ? 'bg-[#0f9d58]' : i <= 4 ? 'bg-[#017FA7]' : 'bg-[#7fb8cc]'}`}
                        style={{ width: `${Math.max(p.pct, p.n ? 1 : 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-[#7a8a95] mt-4">
              Porcentajes sobre los visitantes del periodo. En rojo, cuánta gente se pierde respecto al paso anterior.
              &quot;Abrieron el registro&quot; incluye los clics en &quot;Reservar&quot; de la versión anterior.
            </p>
          </Seccion>
        </div>
        <div className="lg:col-span-2">
          <Seccion titulo="Por día">
            <div className="flex items-end gap-2 h-44">
              {datos?.porDia.map((d) => (
                <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <span className="text-xs tabular-nums text-[#3b4b56]">{d.visitantes}</span>
                  <div className="w-full max-w-8 rounded-t bg-[#017FA7]" style={{ height: `${(d.visitantes / maxDia) * 100}%` }} />
                  <span className="text-[11px] text-[#7a8a95] mt-1 truncate w-full text-center">{diaCorto(d.fecha)}</span>
                  <span className={`text-[11px] tabular-nums ${d.inscritos ? 'text-[#0f9d58] font-medium' : 'text-[#9aa8b1]'}`}>
                    +{d.inscritos}
                  </span>
                </div>
              ))}
              {datos && !datos.porDia.length && <p className="text-sm text-[#7a8a95]">Sin visitas en este periodo</p>}
            </div>
            <p className="text-xs text-[#7a8a95] mt-3">Barras: visitantes. Abajo, en verde: inscritos del día.</p>
          </Seccion>
        </div>
      </div>

      <Seccion titulo="De dónde vienen">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Lista titulo="Fuente" filas={datos?.desglose.fuente ?? []} total={totalVisitantes} />
          <Lista titulo="Campaña" filas={datos?.desglose.campana ?? []} total={totalVisitantes} />
          <Lista titulo="País" filas={datos?.desglose.pais ?? []} total={totalVisitantes} />
          <Lista titulo="Dispositivo" filas={datos?.desglose.dispositivo ?? []} total={totalVisitantes} />
          <Lista titulo="Abrieron en" filas={datos?.desglose.app ?? []} total={totalVisitantes} />
        </div>
      </Seccion>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <Seccion titulo={`Inscritos (${datos?.inscritos.length ?? 0})`}>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#5b6b76] text-[13px]">
                    <th className="font-medium px-1 py-2">Fecha</th>
                    <th className="font-medium px-1 py-2">Nombre</th>
                    <th className="font-medium px-1 py-2">Correo</th>
                    <th className="font-medium px-1 py-2">WhatsApp</th>
                    <th className="font-medium px-1 py-2">País</th>
                    <th className="font-medium px-1 py-2">Origen</th>
                    <th className="px-1 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {datos?.inscritos.map((i) => {
                    const c = revelados[i.id];
                    return (
                      <tr key={i.id} className={`border-t border-[#eef3f6] ${nuevos.has(i.id) ? 'bg-[#e9f7ef]' : ''}`}>
                        <td className="px-1 py-2 whitespace-nowrap">{fechaHora(i.fecha)}</td>
                        <td className="px-1 py-2">
                          {c ? c.name : i.nombre}
                          {i.equipo && <span className="ml-1 text-[11px] text-[#7a8a95]">(equipo)</span>}
                        </td>
                        <td className="px-1 py-2">{c ? c.email : i.correo}</td>
                        <td className="px-1 py-2 whitespace-nowrap">{c ? `${c.whatsapp_country_code ?? ''} ${c.whatsapp ?? ''}` : i.whatsapp}</td>
                        <td className="px-1 py-2">{i.pais}</td>
                        <td className="px-1 py-2">{[i.fuente, i.campana].filter(Boolean).join(' · ')}</td>
                        <td className="px-1 py-2 text-right">
                          {!c && (
                            <button onClick={() => revelar(i.id)} className="text-[#017FA7] hover:underline text-[13px]">
                              Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {datos && !datos.inscritos.length && <p className="text-sm text-[#7a8a95] px-1 py-3">Todavía no hay inscritos en este periodo.</p>}
            </div>
          </Seccion>
        </div>
        <div className="lg:col-span-2">
          <Seccion titulo="Actividad reciente">
            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {datos?.actividad.map((a, n) => (
                <li key={`${a.t}-${n}`} className="text-sm flex gap-3">
                  <span className="tabular-nums text-[#7a8a95] w-16 shrink-0 whitespace-nowrap">{hora(a.t)}</span>
                  <span className="min-w-0">
                    <span className={a.que === 'Se inscribió' ? 'font-medium text-[#0f9d58]' : ''}>{a.que}</span>
                    <span className="text-[#7a8a95]"> · {a.quien}</span>
                    {a.detalle && <span className="block text-xs text-[#7a8a95] truncate">{a.detalle}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Seccion>
        </div>
      </div>

      <p className="text-xs text-[#7a8a95] pb-6">
        Datos de Supabase (visitas y eventos de entrenaciencia.com/vsl e inscripciones a la lista de espera). Se actualiza cada 15 s mientras la
        pestaña está abierta. Un visitante es un navegador, no una persona.
      </p>
    </main>
  );
}
