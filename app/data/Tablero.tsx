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
  new Date(iso).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const diaCorto = (ymd: string) =>
  new Date(`${ymd}T12:00:00-05:00`).toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric' });

const C = { borde: 'border-[#e1e8ec]', suave: 'text-[#5b6b76]', tenue: 'text-[#7a8a95]' };

function Tarjeta({ titulo, valor, ayuda, destacada }: { titulo: string; valor: string; ayuda: string; destacada?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-4 ${destacada ? 'bg-[#017FA7] border-[#017FA7] text-white' : `bg-white ${C.borde}`}`}>
      <p className={`text-[13px] ${destacada ? 'text-white/85' : C.suave}`}>{titulo}</p>
      <p className="text-3xl font-medium mt-1 tabular-nums">{valor}</p>
      <p className={`text-xs mt-1 ${destacada ? 'text-white/80' : C.tenue}`}>{ayuda}</p>
    </div>
  );
}

function Bloque({ n, titulo, sub, children }: { n: number; titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="shrink-0 w-7 h-7 rounded-full bg-[#e6f3f8] text-[#017FA7] text-sm font-medium flex items-center justify-center">{n}</span>
        <div>
          <h2>{titulo}</h2>
          <p className={`text-sm ${C.suave}`}>{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Caja({ titulo, children, className = '' }: { titulo?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border ${C.borde} p-4 sm:p-5 min-w-0 ${className}`}>
      {titulo && <h3 className={`text-sm font-medium mb-3 ${C.suave}`}>{titulo}</h3>}
      {children}
    </div>
  );
}

function Lista({ titulo, filas, total }: { titulo: string; filas: { nombre: string; n: number }[]; total: number }) {
  return (
    <div>
      <p className={`text-[13px] font-medium ${C.suave} mb-2`}>{titulo}</p>
      <ul className="space-y-1.5">
        {filas.slice(0, 6).map((f) => (
          <li key={f.nombre} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="truncate">{f.nombre}</span>
              <span className={`tabular-nums ${C.suave}`}>
                {f.n} · {total ? Math.round((f.n / total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1.5 rounded bg-[#eef3f6] mt-1">
              <div className="h-1.5 rounded bg-[#017FA7]" style={{ width: `${total ? (f.n / total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
        {!filas.length && <li className={`text-sm ${C.tenue}`}>Sin datos</li>}
      </ul>
    </div>
  );
}

function BarraPaso({ nombre, n, pct, perdida, color, fuerte }: { nombre: string; n: number; pct: number; perdida?: number | null; color: string; fuerte?: boolean }) {
  return (
    <li>
      <div className="flex justify-between text-sm mb-1 gap-2">
        <span className={fuerte ? 'font-medium' : ''}>{nombre}</span>
        <span className="tabular-nums text-[#3b4b56] whitespace-nowrap">
          <b className="font-medium">{n}</b> <span className={C.tenue}>· {pct}%</span>
          {perdida != null && perdida > 0 && <span className="text-[#b54708] ml-2 text-xs">−{perdida}%</span>}
        </span>
      </div>
      <div className="h-3 rounded bg-[#eef3f6]">
        <div className={`h-3 rounded ${color}`} style={{ width: `${Math.max(pct, n ? 1 : 0)}%` }} />
      </div>
    </li>
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
  const total = k?.visitantes ?? 0;
  const embudo = datos?.embudo ?? [];
  const lectura = embudo.slice(0, 5);
  const accion = embudo.slice(5);
  const perdida = (i: number) => (i > 0 && lectura[i - 1].n ? Math.round(((lectura[i - 1].n - lectura[i].n) / lectura[i - 1].n) * 100) : null);

  // Resumen en palabras para leer en 5 segundos
  const ideas: string[] = [];
  if (datos && total > 0) {
    let peor = { i: 0, p: -1 };
    lectura.forEach((_, i) => {
      const p = perdida(i);
      if (p != null && p > peor.p) peor = { i, p };
    });
    if (peor.p > 0) ideas.push(`La mayor fuga: el ${peor.p}% se va antes de "${lectura[peor.i].nombre.toLowerCase()}".`);
    const top = datos.canales[0];
    if (top) ideas.push(`${top.nombre} trae más gente: ${top.personas} de ${total} personas (${Math.round((top.personas / total) * 100)}%).`);
    const mejor = [...datos.canales].filter((c) => c.inscritos > 0).sort((a, b) => b.tasa - a.tasa)[0];
    ideas.push(mejor ? `Mejor canal para inscripciones: ${mejor.nombre} (${mejor.tasa}%).` : 'Todavía no hay inscritos en este periodo.');
  }

  const campo = 'rounded-lg border border-[#cbd6dd] bg-white px-3 py-2 text-sm';

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[#e1e8ec]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="mr-auto">
            <p className="text-[11px] uppercase tracking-wider text-[#017FA7] font-medium">Entrena con Ciencia</p>
            <h1 className="panel-titulo">Panel de la landing /neurociencia</h1>
          </div>
          <select value={periodoId} onChange={(e) => setPeriodoId(e.target.value)} className={campo} aria-label="Periodo">
            {opciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <span className="flex items-center gap-1.5 text-sm text-[#3b4b56]" title="Se actualiza solo cada 15 segundos">
            <span className={`inline-block w-2 h-2 rounded-full ${error ? 'bg-[#d03b3b]' : 'bg-[#0ca30c]'} ${cargando ? 'animate-pulse' : ''}`} />
            {error ? 'Sin conexión' : datos ? `En vivo · ${hora(datos.generado)}` : 'Cargando…'}
          </span>
          <form action={salir} className="flex items-center gap-2">
            <span className={`text-xs ${C.tenue} hidden md:inline`}>{correo}</span>
            <button className="rounded-lg border border-[#cbd6dd] px-3 py-1.5 text-sm hover:bg-[#f4f7f9]">Salir</button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {error && <p className="text-sm text-[#b42318]">No se pudieron cargar los datos: {error}</p>}

        {/* Resumen */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Tarjeta titulo="Personas" valor={k ? String(k.visitantes) : '–'} ayuda="distintas que entraron a la página" />
            <Tarjeta titulo="Inscritos" valor={k ? String(k.inscritos) : '–'} ayuda="en la lista de espera" destacada />
            <Tarjeta titulo="Tasa de inscripción" valor={k ? `${k.tasaInscripcion}%` : '–'} ayuda="de cada 100 personas que entran" />
            <Tarjeta titulo="Tiempo en la página" valor={k?.tiempoMediano != null ? `${k.tiempoMediano} s` : '–'} ayuda="lo normal (mediana) por visita" />
          </div>
          <div className={`flex flex-wrap gap-x-5 gap-y-1 text-sm ${C.suave}`}>
            <span>{k ? k.visitas : '–'} visitas</span>
            <span>{k ? k.personasRecurrentes : '–'} personas volvieron</span>
            <span>{k ? k.sesiones : '–'} sesiones</span>
            <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
              <input type="checkbox" checked={incluirEquipo} onChange={(e) => setIncluirEquipo(e.target.checked)} />
              Incluir al equipo
              {k && !incluirEquipo && k.excluidos > 0 && <span className={C.tenue}>({k.excluidos} excluidos)</span>}
            </label>
          </div>
          {ideas.length > 0 && (
            <div className="rounded-xl bg-[#fff8e6] border border-[#f5dfa3] px-4 py-3">
              <p className="text-[13px] font-medium text-[#7a5a00] mb-1">En resumen</p>
              <ul className="text-sm text-[#4a3b0b] space-y-0.5 list-disc pl-5">
                {ideas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Bloque n={1} titulo="¿De dónde llega la gente?" sub="Personas por canal y visitas de cada día">
          <div className="grid lg:grid-cols-5 gap-4">
            <Caja className="lg:col-span-3">
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left ${C.suave} text-[13px]`}>
                      <th className="font-medium px-1 pb-2">Canal</th>
                      <th className="font-medium px-1 pb-2 text-right">Personas</th>
                      <th className="font-medium px-1 pb-2 text-right">Visitas</th>
                      <th className="font-medium px-1 pb-2 text-right" title="Personas que bajaron hasta el final de la página">Leyeron todo</th>
                      <th className="font-medium px-1 pb-2 text-right">Inscritos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos?.canales.map((c) => (
                      <tr key={c.nombre} className="border-t border-[#eef3f6]">
                        <td className="px-1 py-2.5">
                          <span className="font-medium">{c.nombre}</span>
                          <div className="h-1.5 rounded bg-[#eef3f6] mt-1.5 max-w-44">
                            <div className="h-1.5 rounded bg-[#017FA7]" style={{ width: `${total ? (c.personas / total) * 100 : 0}%` }} />
                          </div>
                        </td>
                        <td className="px-1 py-2.5 text-right tabular-nums">
                          <b className="font-medium">{c.personas}</b>{' '}
                          <span className={`text-xs ${C.tenue}`}>{total ? Math.round((c.personas / total) * 100) : 0}%</span>
                        </td>
                        <td className="px-1 py-2.5 text-right tabular-nums">{c.visitas}</td>
                        <td className="px-1 py-2.5 text-right tabular-nums">{c.final}</td>
                        <td className={`px-1 py-2.5 text-right tabular-nums ${c.inscritos ? 'text-[#0f9d58] font-medium' : ''}`}>
                          {c.inscritos}
                          {c.inscritos > 0 && <span className={`text-xs ml-1 ${C.tenue}`}>({c.tasa}%)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datos && !datos.canales.length && <p className={`text-sm ${C.tenue} px-1 py-3`}>Sin visitas en este periodo.</p>}
              </div>
              <p className={`text-xs ${C.tenue} mt-3`}>
                Cada persona cuenta una vez, en el canal por el que llegó la primera vez. &quot;Link directo&quot; = escribió o pegó el link, o
                vino de una app que no avisa su origen (como WhatsApp).
              </p>
            </Caja>
            <Caja titulo="Personas por día" className="lg:col-span-2">
              <div className="flex items-end gap-2 h-44">
                {datos?.porDia.map((d) => (
                  <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                    <span className="text-xs tabular-nums text-[#3b4b56]">{d.visitantes}</span>
                    <div className="w-full max-w-8 rounded-t bg-[#017FA7]" style={{ height: `${(d.visitantes / maxDia) * 100}%` }} />
                    <span className={`text-[11px] ${C.tenue} mt-1 truncate w-full text-center`}>{diaCorto(d.fecha)}</span>
                    <span className={`text-[11px] tabular-nums ${d.inscritos ? 'text-[#0f9d58] font-medium' : 'text-[#9aa8b1]'}`}>+{d.inscritos}</span>
                  </div>
                ))}
                {datos && !datos.porDia.length && <p className={`text-sm ${C.tenue}`}>Sin visitas en este periodo</p>}
              </div>
              <p className={`text-xs ${C.tenue} mt-3`}>Abajo, en verde: inscritos de ese día.</p>
            </Caja>
          </div>
        </Bloque>

        <Bloque n={2} titulo="¿Qué hacen en la página?" sub="De cada 100 personas que entran, cuántas avanzan en cada paso">
          <div className="grid md:grid-cols-2 gap-4">
            <Caja titulo="Cuánto leen">
              <ul className="space-y-3">
                {lectura.map((p, i) => (
                  <BarraPaso key={p.nombre} {...p} perdida={perdida(i)} color="bg-[#017FA7]" />
                ))}
              </ul>
              <p className={`text-xs ${C.tenue} mt-3`}>En naranja: cuánta gente se pierde respecto al paso anterior.</p>
            </Caja>
            <Caja titulo="Qué hacen">
              <ul className="space-y-3">
                {accion.map((p) => (
                  <BarraPaso
                    key={p.nombre}
                    {...p}
                    color={p.nombre === 'Se inscribieron' ? 'bg-[#0f9d58]' : 'bg-[#7fb8cc]'}
                    fuerte={p.nombre === 'Se inscribieron'}
                  />
                ))}
              </ul>
              <p className={`text-xs ${C.tenue} mt-3`}>&quot;Abrieron el registro&quot; incluye los clics en &quot;Reservar&quot; de la versión anterior.</p>
            </Caja>
          </div>
        </Bloque>

        <Bloque n={3} titulo={`Inscritos${datos ? ` (${datos.inscritos.length})` : ''}`} sub="Datos ocultos en parte; toca «Ver» para mostrar el contacto completo">
          <Caja>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left ${C.suave} text-[13px]`}>
                    <th className="font-medium px-1 pb-2">Fecha</th>
                    <th className="font-medium px-1 pb-2">Nombre</th>
                    <th className="font-medium px-1 pb-2">Correo</th>
                    <th className="font-medium px-1 pb-2">WhatsApp</th>
                    <th className="font-medium px-1 pb-2">País</th>
                    <th className="font-medium px-1 pb-2">Canal</th>
                    <th className="px-1 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {datos?.inscritos.map((i) => {
                    const c = revelados[i.id];
                    return (
                      <tr key={i.id} className={`border-t border-[#eef3f6] ${nuevos.has(i.id) ? 'bg-[#e9f7ef]' : ''}`}>
                        <td className="px-1 py-2.5 whitespace-nowrap">{fechaHora(i.fecha)}</td>
                        <td className="px-1 py-2.5">
                          {c ? c.name : i.nombre}
                          {i.equipo && <span className={`ml-1 text-[11px] ${C.tenue}`}>(equipo)</span>}
                        </td>
                        <td className="px-1 py-2.5">{c ? c.email : i.correo}</td>
                        <td className="px-1 py-2.5 whitespace-nowrap">{c ? `${c.whatsapp_country_code ?? ''} ${c.whatsapp ?? ''}` : i.whatsapp}</td>
                        <td className="px-1 py-2.5">{i.pais}</td>
                        <td className="px-1 py-2.5">{[i.fuente, i.campana].filter(Boolean).join(' · ')}</td>
                        <td className="px-1 py-2.5 text-right">
                          {!c && (
                            <button onClick={() => revelar(i.id)} className="rounded-md border border-[#cbd6dd] px-2 py-0.5 text-[13px] text-[#017FA7] hover:bg-[#f4f7f9]">
                              Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {datos && !datos.inscritos.length && <p className={`text-sm ${C.tenue} px-1 py-3`}>Todavía no hay inscritos en este periodo.</p>}
            </div>
          </Caja>
        </Bloque>

        <Bloque n={4} titulo="Más detalle" sub="Quiénes son y qué está pasando ahora">
          <div className="grid lg:grid-cols-5 gap-4">
            <Caja className="lg:col-span-3">
              <div className="grid sm:grid-cols-2 gap-6">
                <Lista titulo="País" filas={datos?.desglose.pais ?? []} total={total} />
                <Lista titulo="Dispositivo" filas={datos?.desglose.dispositivo ?? []} total={total} />
                <Lista titulo="Abrieron en" filas={datos?.desglose.app ?? []} total={total} />
                <Lista titulo="Etiqueta del link (UTM)" filas={datos?.desglose.utm ?? []} total={total} />
              </div>
            </Caja>
            <Caja titulo="Actividad en vivo" className="lg:col-span-2">
              <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {datos?.actividad.map((a, n) => (
                  <li key={`${a.t}-${n}`} className="text-sm flex gap-3">
                    <span className={`tabular-nums ${C.tenue} w-11 shrink-0 whitespace-nowrap`}>{hora(a.t)}</span>
                    <span className="min-w-0">
                      <span className={a.que === 'Se inscribió' ? 'font-medium text-[#0f9d58]' : ''}>{a.que}</span>
                      <span className={C.tenue}> · {a.quien}</span>
                      {a.detalle && <span className={`block text-xs ${C.tenue} truncate`}>{a.detalle}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Caja>
          </div>
        </Bloque>

        <div className={`text-xs ${C.tenue} border-t border-[#e1e8ec] pt-4 pb-8 flex flex-wrap gap-x-4 gap-y-1`}>
          <span>Datos de Supabase: visitas, eventos y lista de espera de entrenaciencia.com/neurociencia.</span>
          <span>Persona = un dispositivo o navegador.</span>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="text-[#017FA7] hover:underline">
            Abrir Vercel Analytics ↗
          </a>
        </div>
      </main>
    </div>
  );
}
