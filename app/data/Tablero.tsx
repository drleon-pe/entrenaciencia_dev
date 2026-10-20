'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DatosPanel } from '@/lib/panel/datos';
import { salir } from './acciones';

type Version = { id: string; nombre: string; desde: string };
type Periodo = { id: string; nombre: string; desde: string; hasta: string };

const CADA_MS = 5_000; // en vivo: revisa cada 5 segundos mientras la pestaña está a la vista
const FUTURO = '2100-01-01T00:00:00Z';
/** Por debajo de esto, un porcentaje es poco confiable y se marca. */
const MUESTRA_MINIMA = 30;

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
    { id: 'hoy', nombre: 'Hoy', desde: inicioDiaLima(0), hasta: FUTURO },
    { id: 'ayer', nombre: 'Ayer', desde: inicioDiaLima(1), hasta: inicioDiaLima(0) },
    { id: '7d', nombre: 'Últimos 7 días', desde: inicioDiaLima(6), hasta: FUTURO },
    { id: '14d', nombre: 'Últimos 14 días', desde: inicioDiaLima(13), hasta: FUTURO },
    ...lista,
    { id: 'todo', nombre: 'Todo', desde: new Date(versiones[0].desde).toISOString(), hasta: FUTURO },
  ];
}

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false });
const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const diaCorto = (ymd: string) =>
  new Date(`${ymd}T12:00:00-05:00`).toLocaleDateString('es-PE', { timeZone: 'America/Lima', weekday: 'short', day: 'numeric' });

// Marca Entrena con Ciencia: navy #0A2540, teal #017FA7, cian #23D3FF, amarillo #FFC300, fondo #F5FAFC (Poppins).
const C = { borde: 'border-[#d9e8f0]', suave: 'text-[#3e5260]', tenue: 'text-[#627682]' };
const AZUL = '#017FA7';
const CELESTE = '#9fd3e3';
const VERDE = '#0f9d58';

/** Cambio frente al periodo anterior. `puntos` = diferencia en puntos porcentuales (para tasas). */
function Cambio({ ahora, antes, puntos }: { ahora: number; antes: number | undefined; puntos?: boolean }) {
  if (antes == null) return null;
  const d = puntos ? Math.round((ahora - antes) * 10) / 10 : antes ? Math.round(((ahora - antes) / antes) * 100) : null;
  if (d == null || d === 0) return <span className={`text-xs ${C.tenue}`}>{d === 0 ? 'igual que antes' : 'sin datos antes'}</span>;
  const sube = d > 0;
  return (
    <span className={`text-xs font-medium ${sube ? 'text-[#0f7a45]' : 'text-[#b54708]'}`}>
      {sube ? '▲' : '▼'} {Math.abs(d)}
      {puntos ? ' pts' : '%'} <span className={`font-normal ${C.tenue}`}>vs. periodo anterior</span>
    </span>
  );
}

function Tarjeta({ titulo, valor, ayuda, destacada, children }: { titulo: string; valor: string; ayuda: string; destacada?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border bg-white px-4 py-4 shadow-[0_8px_24px_-12px_rgba(11,31,44,.10)] ${destacada ? 'border-[#FFC300] border-2' : C.borde}`}>
      <p className={`text-[13px] ${C.suave} flex items-center gap-1.5`}>
        {destacada && <i className="inline-block w-2 h-2 rounded-full bg-[#FFC300]" />}
        {titulo}
      </p>
      <p className="text-3xl font-extrabold mt-1 tabular-nums text-[#0A2540] tracking-tight">{valor}</p>
      <p className={`text-xs mt-1 ${C.tenue}`}>{ayuda}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Bloque({ n, titulo, sub, children }: { n: number; titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-[#0A2540] text-[#23D3FF] text-sm font-extrabold flex items-center justify-center">{n}</span>
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
    <div className={`bg-white rounded-2xl border ${C.borde} p-4 sm:p-5 min-w-0 shadow-[0_8px_24px_-12px_rgba(11,31,44,.10)] ${className}`}>
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

/** Porcentaje con aviso cuando la base es chica. */
function Tasa({ valor, base }: { valor: number; base: number }) {
  return (
    <span className={base < MUESTRA_MINIMA ? C.tenue : ''} title={base < MUESTRA_MINIMA ? `Solo ${base} personas: todavía poco confiable` : undefined}>
      {valor}%{base < MUESTRA_MINIMA && <sup>*</sup>}
    </span>
  );
}

type FilaAnuncio = DatosPanel['anuncios']['porAnuncio'][number];

function TablaAnuncios({ filas, etiqueta, verPlataforma }: { filas: FilaAnuncio[]; etiqueta: string; verPlataforma: boolean }) {
  const th = 'font-medium px-2 pb-2 text-right whitespace-nowrap';
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className={`${C.suave} text-[13px]`}>
            <th className="font-medium px-1 pb-2 text-left">{etiqueta}</th>
            <th className={th}>Personas</th>
            <th className={th} title="De las personas que llegaron por este anuncio, cuántas bajaron hasta la mitad de la página">Leyeron la mitad</th>
            <th className={th}>Llegaron al final</th>
            <th className={th} title="Mediana de segundos en la página">Tiempo</th>
            <th className={th}>Abrieron registro</th>
            <th className={th}>Inscritos</th>
            <th className={th}>Conversión</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.nombre} className="border-t border-[#eef3f6]">
              <td className="px-1 py-2.5 font-medium">
                {verPlataforma && f.plataforma && (
                  <span className={`mr-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold align-middle ${f.plataforma === 'TikTok' ? 'bg-[#111] text-white' : 'bg-[#e7f0fe] text-[#1a56c4]'}`}>{f.plataforma}</span>
                )}
                <span className={f.personas ? '' : C.tenue}>{f.nombre}</span>
                {!f.personas && <span className={`block text-[11px] font-normal ${C.tenue}`}>Publicado, sin clics reales todavía (solo la revisión de la plataforma)</span>}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{f.personas}</td>
              <td className="px-2 py-2.5 text-right tabular-nums"><Tasa valor={f.mitad} base={f.personas} /></td>
              <td className="px-2 py-2.5 text-right tabular-nums"><Tasa valor={f.final} base={f.personas} /></td>
              <td className="px-2 py-2.5 text-right tabular-nums">{f.tiempo != null ? `${f.tiempo} s` : '–'}</td>
              <td className="px-2 py-2.5 text-right tabular-nums">{f.registro}</td>
              <td className={`px-2 py-2.5 text-right tabular-nums ${f.inscritos ? 'text-[#0f9d58] font-medium' : ''}`}>{f.inscritos}</td>
              <td className="px-2 py-2.5 text-right tabular-nums"><Tasa valor={f.tasa} base={f.personas} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filas.length && <p className={`text-sm ${C.tenue} px-1 py-3`}>No hubo clics de anuncios en este periodo.</p>}
    </div>
  );
}

export default function Tablero({ correo, versiones }: { correo: string; versiones: Version[] }) {
  const opciones = useMemo(() => periodos(versiones), [versiones]);
  const [periodoId, setPeriodoId] = useState('7d');
  const [incluirEquipo, setIncluirEquipo] = useState(false);
  const [fuente, setFuente] = useState<'todo' | 'meta' | 'tiktok'>('todo');
  const [vistaAnuncios, setVistaAnuncios] = useState<'porAnuncio' | 'porUbicacion' | 'porConjunto' | 'porCampana'>('porAnuncio');
  const [plataformaAnuncios, setPlataformaAnuncios] = useState<'Todas' | 'Meta' | 'TikTok'>('Todas');
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [revelados, setRevelados] = useState<Record<string, { name: string; email: string; whatsapp: string; whatsapp_country_code: string }>>({});
  const [nuevos, setNuevos] = useState<Set<string>>(new Set());
  const vistos = useRef<Set<string> | null>(null);
  // Cuándo apareció cada movimiento: los nuevos quedan resaltados 20 segundos
  const movVistos = useRef<Map<string, number> | null>(null);
  const [movNuevos, setMovNuevos] = useState<Set<string>>(new Set());

  const periodo = opciones.find((p) => p.id === periodoId)!;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const q = new URLSearchParams({ desde: periodo.desde, hasta: periodo.hasta, equipo: incluirEquipo ? '1' : '0', fuente });
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
      // Resaltar movimientos nuevos de la actividad en vivo
      const ahora = Date.now();
      const previos = movVistos.current;
      const vistosAhora = new Map<string, number>();
      for (const x of d.actividad) {
        const c = `${x.t}|${x.quien}|${x.que}`;
        vistosAhora.set(c, previos ? (previos.get(c) ?? ahora) : 0);
      }
      movVistos.current = vistosAhora;
      setMovNuevos(new Set([...vistosAhora].filter(([, t]) => t && ahora - t < 20_000).map(([c]) => c)));
      setDatos(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setCargando(false);
    }
  }, [periodo.desde, periodo.hasta, incluirEquipo, fuente]);

  useEffect(() => {
    vistos.current = null;
    movVistos.current = null;
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
  const a = datos?.anterior.kpis;
  const total = k?.personas ?? 0;
  const maxDia = Math.max(1, ...(datos?.porDia.map((d) => d.personas) ?? [1]));
  const embudo = datos?.embudo ?? [];
  const caida = (i: number, g: 'todos' | 'anuncios' | 'organico') =>
    i > 0 && embudo[i - 1][g].n ? Math.round(((embudo[i - 1][g].n - embudo[i][g].n) / embudo[i - 1][g].n) * 100) : null;

  // Lectura en 5 segundos
  const ideas: string[] = [];
  if (datos && total > 0) {
    let peor = { i: 0, p: -1 };
    embudo.forEach((_, i) => {
      const p = caida(i, 'todos');
      if (p != null && p > peor.p) peor = { i, p };
    });
    if (peor.p > 0) ideas.push(`La mayor fuga está antes de "${embudo[peor.i].nombre.toLowerCase()}": se va el ${peor.p}% del paso anterior.`);
    if (k!.deAnuncios)
      ideas.push(
        `Los anuncios trajeron ${k!.deAnuncios} de ${total} personas (${Math.round((k!.deAnuncios / total) * 100)}%) y convierten al ${k!.conversionAnuncios}%.`,
      );
    for (const p of datos.porPlataforma) if (p.personas) ideas.push(`${p.nombre}: ${p.personas} personas, ${p.inscritos} inscritos (${p.tasa}%).`);
    const conBase = datos.anuncios.porAnuncio.filter((f) => f.personas >= 5);
    const mejor = [...conBase].sort((x, y) => y.tasa - x.tasa || y.final - x.final)[0];
    if (mejor) ideas.push(`Anuncio con mejor respuesta: "${mejor.nombre}" (${mejor.personas} personas, ${mejor.final}% leyó hasta el final, ${mejor.inscritos} inscritos).`);
    if (!k!.inscritos) ideas.push('Todavía no hay inscritos en este periodo.');
  }

  const campo = 'rounded-lg border border-white/20 bg-white text-[#0A2540] px-3 py-2 text-sm';
  const VISTAS = [
    { id: 'porAnuncio', nombre: 'Anuncio', boton: 'Por anuncio' },
    { id: 'porUbicacion', nombre: 'Dónde se mostró', boton: 'Por ubicación' },
    { id: 'porConjunto', nombre: 'Conjunto / grupo', boton: 'Por conjunto' },
    { id: 'porCampana', nombre: 'Campaña', boton: 'Por campaña' },
  ] as const;
  const filasAnuncios = (datos?.anuncios[vistaAnuncios] ?? []).filter((f) => plataformaAnuncios === 'Todas' || f.plataforma === plataformaAnuncios);
  const boton = (activo: boolean) =>
    `rounded-full px-3 py-1 text-[13px] border ${activo ? 'bg-[#0A2540] border-[#0A2540] text-white' : 'border-[#c3dae6] text-[#3e5260] hover:bg-[#eef6fa]'}`;

  return (
    <div>
      <header className="sticky top-0 z-10 bg-[#0A2540] text-white shadow-[0_8px_24px_-16px_rgba(1,13,21,.6)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="mr-auto flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/isotipo-cyan.png" alt="" width={40} height={40} className="w-10 h-10" />
            <div>
              <p className="text-[11px] uppercase tracking-[.14em] font-extrabold leading-tight">
                Entrena <span className="text-[#23D3FF]">con Ciencia</span>
              </p>
              <h1 className="panel-titulo text-white">Panel de la landing /neurociencia</h1>
            </div>
          </div>
          <select value={periodoId} onChange={(e) => setPeriodoId(e.target.value)} className={campo} aria-label="Periodo">
            {opciones.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <span className="flex items-center gap-1.5 text-sm text-[#C9D8E4]" title="Se actualiza sola cada 5 segundos">
            <span className={`inline-block w-2 h-2 rounded-full ${error ? 'bg-[#ff6b6b]' : 'bg-[#23D3FF]'} ${cargando ? 'animate-pulse' : ''}`} />
            {error ? 'Sin conexión' : datos ? `En vivo · ${hora(datos.generado)}` : 'Cargando…'}
          </span>
          {k && (
            <span className="rounded-full bg-[#FFC300] text-[#0A2540] px-3 py-1 text-sm font-extrabold tabular-nums" title="Personas con actividad en los últimos 5 minutos">
              {k.enLinea} en la página ahora
            </span>
          )}
          <form action={salir} className="flex items-center gap-2">
            <span className="text-xs text-[#C9D8E4] hidden md:inline">{correo}</span>
            <button className="rounded-lg border border-white/30 px-3 py-1.5 text-sm text-white hover:bg-white/10">Salir</button>
          </form>
        </div>
      <div className="bg-white border-b border-[#dfe9ef] text-[#0A2540]" aria-label="Plataforma">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto" role="tablist">
          {([
            { id: 'todo', nombre: 'Todo' },
            { id: 'meta', nombre: 'Instagram y Facebook' },
            { id: 'tiktok', nombre: 'TikTok' },
          ] as const).map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={fuente === t.id}
              onClick={() => {
                setFuente(t.id);
                setPlataformaAnuncios(t.id === 'meta' ? 'Meta' : t.id === 'tiktok' ? 'TikTok' : 'Todas');
              }}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-[3px] -mb-px ${fuente === t.id ? 'border-[#017FA7] text-[#0A2540]' : 'border-transparent text-[#5b6f7d] hover:text-[#0A2540]'}`}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {error && <p className="text-sm text-[#b42318]">No se pudieron cargar los datos: {error}</p>}

        {/* Resumen + actividad en vivo */}
        <div className="grid lg:grid-cols-5 gap-4 items-start">
        <div className="space-y-3 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3">
            <Tarjeta titulo="Personas" valor={k ? String(k.personas) : '–'} ayuda="distintas que entraron a la página">
              {k && <Cambio ahora={k.personas} antes={a?.personas} />}
            </Tarjeta>
            <Tarjeta titulo="Desde anuncios" valor={k ? String(k.deAnuncios) : '–'} ayuda={k && total ? `${Math.round((k.deAnuncios / total) * 100)}% de las personas` : 'personas que hicieron clic'}>
              {k && <Cambio ahora={k.deAnuncios} antes={a?.deAnuncios} />}
            </Tarjeta>
            <Tarjeta titulo="Inscritos" valor={k ? String(k.inscritos) : '–'} ayuda="en la lista de espera" destacada>
              {k && <Cambio ahora={k.inscritos} antes={a?.inscritos} />}
            </Tarjeta>
            <Tarjeta titulo="Conversión" valor={k ? `${k.conversion}%` : '–'} ayuda="personas que se inscriben">
              {k && <Cambio ahora={k.conversion} antes={a?.conversion} puntos />}
            </Tarjeta>
          </div>
          {ideas.length > 0 && (
            <div className="rounded-2xl bg-[#FFF6D6] border-l-4 border-[#FFC300] px-4 py-3">
              <p className="text-[13px] font-extrabold text-[#0A2540] mb-1">En resumen</p>
              <ul className="text-sm text-[#0A2540] space-y-0.5 list-disc pl-5">
                {ideas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
            <Caja titulo="Actividad en vivo" className="lg:col-span-2">
              <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {datos?.actividad.map((x, n) => (
                  <li key={`${x.t}-${n}`} className={`text-sm flex gap-3 rounded-md px-1 -mx-1 transition-colors duration-[2000ms] ${movNuevos.has(`${x.t}|${x.quien}|${x.que}`) ? 'bg-[#FFF0B8]' : ''}`}>
                    <span className={`tabular-nums ${C.tenue} w-11 shrink-0 whitespace-nowrap`}>{hora(x.t)}</span>
                    <span className="min-w-0">
                      <span className={x.que === 'Se inscribió' ? 'font-medium text-[#0f9d58]' : ''}>{x.que}</span>
                      <span className={C.tenue}> · {x.quien}</span>
                      {x.detalle && <span className={`block text-xs ${C.tenue} truncate`}>{x.detalle}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Caja>
        </div>

        <Bloque n={1} titulo="Flujo diario" sub="Personas distintas que entran cada día (hora de Lima), separadas por origen">
          <Caja>
            <div className="flex items-end gap-1.5 sm:gap-2 h-48">
              {datos?.porDia.map((d) => (
                <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${d.personas} personas: ${d.anuncios} de anuncios, ${d.organico} orgánicas · ${d.inscritos} inscritos`}>
                  <span className="text-xs tabular-nums text-[#3b4b56]">{d.personas}</span>
                  <div className="w-full max-w-9 flex flex-col justify-end" style={{ height: `${(d.personas / maxDia) * 100}%` }}>
                    <div className="w-full rounded-t" style={{ background: AZUL, height: `${d.personas ? (d.anuncios / d.personas) * 100 : 0}%` }} />
                    <div className={`w-full ${d.anuncios ? '' : 'rounded-t'}`} style={{ background: CELESTE, height: `${d.personas ? (d.organico / d.personas) * 100 : 0}%` }} />
                  </div>
                  <span className={`text-[11px] ${C.tenue} mt-1 truncate w-full text-center`}>{diaCorto(d.fecha)}</span>
                </div>
              ))}
              {datos && !datos.porDia.length && <p className={`text-sm ${C.tenue}`}>Sin visitas en este periodo</p>}
            </div>
            <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${C.suave} mt-3`}>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: AZUL }} /> Desde anuncios</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: CELESTE }} /> Orgánico (bio, directo, web…)</span>
            </div>
            <div className="overflow-x-auto -mx-1 mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px] text-right`}>
                    <th className="font-medium px-1 pb-2 text-left">Día</th>
                    <th className="font-medium px-2 pb-2">Personas</th>
                    <th className="font-medium px-2 pb-2" title="Entraron por primera vez ese día">Nuevas</th>
                    <th className="font-medium px-2 pb-2">De anuncios</th>
                    <th className="font-medium px-2 pb-2">Orgánicas</th>
                    <th className="font-medium px-2 pb-2">Inscritos</th>
                    <th className="font-medium px-2 pb-2">Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(datos?.porDia ?? [])].reverse().map((d) => (
                    <tr key={d.fecha} className="border-t border-[#eef3f6] text-right tabular-nums">
                      <td className="px-1 py-2 text-left whitespace-nowrap">{diaCorto(d.fecha)}</td>
                      <td className="px-2 py-2 font-medium">{d.personas}</td>
                      <td className="px-2 py-2">{d.nuevas}</td>
                      <td className="px-2 py-2">{d.anuncios}</td>
                      <td className="px-2 py-2">{d.organico}</td>
                      <td className={`px-2 py-2 ${d.inscritos ? 'text-[#0f9d58] font-medium' : ''}`}>{d.inscritos}</td>
                      <td className="px-2 py-2"><Tasa valor={d.tasa} base={d.personas} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Caja>
        </Bloque>

        <Bloque n={2} titulo={fuente === 'meta' ? 'Anuncios de Meta' : fuente === 'tiktok' ? 'Anuncios de TikTok' : 'Anuncios (Meta y TikTok)'} sub="Qué hace la gente que llega por cada anuncio. Cada persona cuenta en el anuncio de su primer clic">
          <Caja>
            {fuente === 'todo' && <div className="flex flex-wrap items-center gap-1.5 mb-2" role="tablist" aria-label="Plataforma">
              {(['Todas', 'Meta', 'TikTok'] as const).map((p) => {
                const info = datos?.porPlataforma.find((x) => x.nombre === p);
                return (
                  <button key={p} role="tab" aria-selected={plataformaAnuncios === p} onClick={() => setPlataformaAnuncios(p)} className={boton(plataformaAnuncios === p)}>
                    {p}
                    {info && <span className="opacity-70"> · {info.personas}</span>}
                  </button>
                );
              })}
            </div>}
            <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Agrupar por">
              {VISTAS.map((v) => (
                <button key={v.id} role="tab" aria-selected={vistaAnuncios === v.id} onClick={() => setVistaAnuncios(v.id)} className={boton(vistaAnuncios === v.id)}>
                  {v.boton}
                </button>
              ))}
            </div>
            {vistaAnuncios === 'porUbicacion' && (
              <p className={`text-xs ${C.suave} mb-3`}>
                Dónde la plataforma mostró el anuncio. WhatsApp Estados, Historias de Instagram, Reels, etc. son espacios <b>pagados</b> de Meta: esas personas vieron un anuncio, no algo que compartimos.
              </p>
            )}
            <TablaAnuncios filas={filasAnuncios} etiqueta={VISTAS.find((v) => v.id === vistaAnuncios)!.nombre} verPlataforma={plataformaAnuncios === 'Todas'} />
            <p className={`text-xs ${C.tenue} mt-3`}>
              * Menos de {MUESTRA_MINIMA} personas: el porcentaje todavía puede cambiar mucho. Costo, impresiones y clics totales se ven en el Administrador de anuncios
              de Meta y en TikTok Ads Manager; aquí se mide lo que la gente hace en la página.
              {datos && datos.calidad.robots > 0 && ` Se excluyeron ${datos.calidad.robots} visitas de robots de revisión (clics de anuncio desde fuera de Perú).`}
            </p>
          </Caja>
        </Bloque>

        <Bloque n={3} titulo="¿Dónde se pierde la gente?" sub="De cada 100 personas que entran, cuántas llegan a cada paso">
          <Caja>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px]`}>
                    <th className="font-medium px-1 pb-2 text-left">Paso</th>
                    <th className="font-medium px-2 pb-2 text-left w-[40%]">Todos</th>
                    <th className="font-medium px-2 pb-2 text-right">Anuncios</th>
                    <th className="font-medium px-2 pb-2 text-right">Orgánico</th>
                  </tr>
                </thead>
                <tbody>
                  {embudo.map((p, i) => {
                    const c = caida(i, 'todos');
                    const ultimo = i === embudo.length - 1;
                    return (
                      <tr key={p.nombre} className="border-t border-[#eef3f6]">
                        <td className={`px-1 py-2.5 ${ultimo ? 'font-medium' : ''}`}>{p.nombre}</td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 rounded bg-[#eef3f6] min-w-16">
                              <div className="h-3 rounded" style={{ background: ultimo ? VERDE : AZUL, width: `${Math.max(p.todos.pct, p.todos.n ? 1 : 0)}%` }} />
                            </div>
                            <span className="tabular-nums whitespace-nowrap w-24 text-right">
                              <b className="font-medium">{p.todos.n}</b> <span className={C.tenue}>· {p.todos.pct}%</span>
                            </span>
                            <span className="text-xs text-[#b54708] tabular-nums w-11 text-right">{c != null && c > 0 ? `−${c}%` : ''}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums">
                          {p.anuncios.n} <span className={C.tenue}>· <Tasa valor={p.anuncios.pct} base={embudo[0].anuncios.n} /></span>
                        </td>
                        <td className="px-2 py-2.5 text-right tabular-nums">
                          {p.organico.n} <span className={C.tenue}>· <Tasa valor={p.organico.pct} base={embudo[0].organico.n} /></span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={`flex flex-wrap gap-x-5 gap-y-1 text-sm ${C.suave} mt-4 pt-3 border-t border-[#eef3f6]`}>
              {datos?.interacciones.map((x) => (
                <span key={x.nombre}>
                  {x.nombre}: <b className="font-medium text-[#0b1f2c]">{x.n}</b> ({x.pct}%)
                </span>
              ))}
              {k?.tiempoMediano != null && (
                <span>
                  Tiempo en la página: <b className="font-medium text-[#0b1f2c]">{k.tiempoMediano} s</b> (mediana)
                </span>
              )}
            </div>
            <p className={`text-xs ${C.tenue} mt-2`}>En naranja: cuánta gente se pierde respecto al paso anterior.</p>
          </Caja>
        </Bloque>

        <Bloque n={4} titulo="Canales" sub="Por dónde llegó cada persona la primera vez y cuánto convierte">
          <Caja>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px] text-right`}>
                    <th className="font-medium px-1 pb-2 text-left">Canal</th>
                    <th className="font-medium px-2 pb-2">Personas</th>
                    <th className="font-medium px-2 pb-2">Llegaron al final</th>
                    <th className="font-medium px-2 pb-2">Abrieron registro</th>
                    <th className="font-medium px-2 pb-2">Inscritos</th>
                    <th className="font-medium px-2 pb-2">Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {datos?.canales.map((c) => (
                    <tr key={c.nombre} className="border-t border-[#eef3f6] text-right tabular-nums">
                      <td className="px-1 py-2.5 text-left">
                        <span className="font-medium">{c.nombre}</span>
                        <div className="h-1.5 rounded bg-[#eef3f6] mt-1.5 max-w-44">
                          <div className="h-1.5 rounded bg-[#017FA7]" style={{ width: `${total ? (c.personas / total) * 100 : 0}%` }} />
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <b className="font-medium">{c.personas}</b> <span className={`text-xs ${C.tenue}`}>{total ? Math.round((c.personas / total) * 100) : 0}%</span>
                      </td>
                      <td className="px-2 py-2.5"><Tasa valor={c.finalPct} base={c.personas} /></td>
                      <td className="px-2 py-2.5">{c.registro}</td>
                      <td className={`px-2 py-2.5 ${c.inscritos ? 'text-[#0f9d58] font-medium' : ''}`}>{c.inscritos}</td>
                      <td className="px-2 py-2.5"><Tasa valor={c.tasa} base={c.personas} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {datos && !datos.canales.length && <p className={`text-sm ${C.tenue} px-1 py-3`}>Sin visitas en este periodo.</p>}
            </div>
            <p className={`text-xs ${C.tenue} mt-3`}>
              &quot;Link directo&quot; = escribió o pegó el link, o vino de una app que no avisa su origen (como WhatsApp).
            </p>
          </Caja>
        </Bloque>

        <Bloque n={5} titulo={`Inscritos${datos ? ` (${datos.inscritos.length})` : ''}`} sub="Datos ocultos en parte; toca «Ver» para mostrar el contacto completo">
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
                    <th className="font-medium px-1 pb-2">Llegó por</th>
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
                        <td className="px-1 py-2.5">{i.anuncio ? `Anuncio: ${i.anuncio}` : i.fuente}</td>
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

        <Bloque n={6} titulo="Más detalle" sub="Quiénes son, qué está pasando ahora y calidad de los datos">
          <div>
            <Caja>
              <div className="grid sm:grid-cols-2 gap-6">
                <Lista titulo="País" filas={datos?.desglose.pais ?? []} total={total} />
                <Lista titulo="Dispositivo" filas={datos?.desglose.dispositivo ?? []} total={total} />
              </div>
              <div className={`mt-6 pt-4 border-t border-[#eef3f6] text-sm ${C.suave}`}>
                <p className="text-[13px] font-medium mb-2">Calidad de los datos</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  <li>{datos?.calidad.visitas ?? '–'} visitas en total ({datos?.calidad.sesiones ?? '–'} sesiones)</li>
                  <li>{datos?.calidad.volvieron ?? '–'} personas entraron más de una vez</li>
                  <li>{datos?.calidad.robots ?? '–'} robots de Meta excluidos</li>
                  <li className="flex items-center gap-2">
                    <span>{incluirEquipo ? 'Equipo incluido' : `${datos?.calidad.equipo ?? '–'} del equipo excluidos`}</span>
                    <label className="flex items-center gap-1 cursor-pointer text-xs">
                      <input type="checkbox" checked={incluirEquipo} onChange={(e) => setIncluirEquipo(e.target.checked)} />
                      incluir
                    </label>
                  </li>
                  <li>{datos?.calidad.sinEtiqueta ?? '–'} personas sin etiqueta UTM</li>
                </ul>
              </div>
            </Caja>
          </div>
        </Bloque>

        <div className={`text-xs ${C.tenue} border-t border-[#e1e8ec] pt-4 pb-8 flex flex-wrap gap-x-4 gap-y-1`}>
          <span>Datos de Supabase: visitas, eventos y lista de espera de entrenaciencia.com/neurociencia.</span>
          <span>Persona = un dispositivo o navegador.</span>
          {datos && <span>Comparado con {fechaHora(datos.anterior.desde)} – {fechaHora(datos.anterior.hasta)}.</span>}
        </div>
      </main>
    </div>
  );
}
