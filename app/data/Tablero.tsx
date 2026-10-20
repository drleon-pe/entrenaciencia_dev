'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DatosCambio, DatosPanel, RecorridoInscrito } from '@/lib/panel/datos';
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
    ...(lista.length > 1 ? lista : []),
    { id: 'todo', nombre: 'Todo desde la lista de espera (11 oct)', desde: new Date(versiones[0].desde).toISOString(), hasta: FUTURO },
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
/** Colores del tráfico por plataforma (mismo orden que GRUPOS_TRAFICO). */
const GRUPOS = [
  { id: 'Anuncios Meta', corto: 'Anuncios Meta', color: '#1a56c4' },
  { id: 'Instagram y Facebook orgánico', corto: 'IG/FB orgánico', color: '#d6489b' },
  { id: 'Anuncios TikTok', corto: 'Anuncios TikTok', color: '#111111' },
  { id: 'TikTok orgánico', corto: 'TikTok orgánico', color: '#25c6d3' },
  { id: 'Otros', corto: 'Otros', color: '#b9c9d3' },
] as const;
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

function Bloque({ n, id, titulo, sub, resumen, children }: { n: number | string; id?: string; titulo: string; sub: string; resumen?: string[]; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-48">
      <div className="flex items-baseline gap-3">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-[#0A2540] text-[#23D3FF] text-sm font-extrabold flex items-center justify-center">{n}</span>
        <div>
          <h2>{titulo}</h2>
          <p className={`text-sm ${C.suave}`}>{sub}</p>
        </div>
      </div>
      {resumen && resumen.length > 0 && <EnPocasPalabras items={resumen} />}
      {children}
    </section>
  );
}

/** Lectura en lenguaje simple de lo que muestra cada bloque. */
function EnPocasPalabras({ items, titulo = 'En pocas palabras' }: { items: string[]; titulo?: string }) {
  return (
    <div className="rounded-2xl bg-[#E9F6FB] border-l-4 border-[#017FA7] px-4 py-3">
      <p className="text-[13px] font-extrabold text-[#0A2540] mb-1">{titulo}</p>
      <ul className="text-sm text-[#0A2540] space-y-1 list-disc pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/** Mini guía para leer el panel sin saber de analítica. */
function Guia() {
  const termino = (t: string, d: string) => (
    <li>
      <b className="text-[#0A2540]">{t}:</b> {d}
    </li>
  );
  return (
    <details className="rounded-2xl border border-[#d9e8f0] bg-white px-4 py-3 shadow-[0_8px_24px_-12px_rgba(11,31,44,.10)]">
      <summary className="cursor-pointer text-sm font-semibold text-[#017FA7]">¿Cómo leer este panel? (1 minuto)</summary>
      <div className={`mt-3 grid md:grid-cols-2 gap-x-8 gap-y-1 text-sm ${C.suave}`}>
        <ul className="space-y-1.5">
          {termino('Persona', 'cada celular o computadora distinto que entró a la página. Si alguien entra 3 veces, cuenta una sola vez.')}
          {termino('Inscrito', 'persona que dejó sus datos en la lista de espera.')}
          {termino('Tasa de inscripción (CVR)', 'de cada 100 personas que entran, cuántas se inscriben. Es el número más importante.')}
          {termino('CTR del botón', 'de cada 100 personas que entran, cuántas hacen clic en «Inscríbete» y abren el formulario.')}
          {termino('CVR del formulario', 'de cada 100 que abren el formulario, cuántas terminan de inscribirse.')}
          {termino('Anuncio', 'la persona llegó haciendo clic en un anuncio pagado de Meta (Instagram/Facebook) o TikTok.')}
          {termino('Orgánico', 'llegó sin anuncio: desde un post, la bio, un link compartido o la web.')}
        </ul>
        <ul className="space-y-1.5">
          {termino('Se fue en menos de 5 s', 'entró y se fue casi de inmediato, sin bajar por la página.')}
          {termino('Tiempo típico', 'la mitad de la gente estuvo menos que eso y la otra mitad, más.')}
          {termino('Número con *', 'son menos de 30 personas: todavía puede cambiar mucho, no conviene sacar conclusiones.')}
          {termino('▲ ▼ y «real»', 'la diferencia es grande y hay muy poca probabilidad (menos de 5%) de que sea casualidad.')}
          {termino('«Puede ser azar»', 'hay diferencia, pero con tan pocas personas todavía podría ser coincidencia.')}
          {termino('CTR de los anuncios', 'clics ÷ veces que se mostró el anuncio. Ese dato lo tiene Meta o TikTok, no la página: se ve en su Ads Manager.')}
        </ul>
      </div>
    </details>
  );
}

const SECCIONES_PANEL = [
  { id: 'resumen', nombre: 'Cómo vamos' },
  { id: 'origen', nombre: 'De dónde viene la gente' },
  { id: 'pagina', nombre: 'Qué hace en la página' },
  { id: 'plataformas', nombre: 'Cada plataforma' },
  { id: 'anuncios', nombre: 'Anuncios' },
  { id: 'inscritos', nombre: 'Inscritos' },
  { id: 'detalle', nombre: 'Más detalle' },
];

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

/** Probabilidad de ver una diferencia así solo por azar (prueba de dos proporciones). Menos de 0,05 = diferencia real. */
function pValor(k1: number, n1: number, k2: number, n2: number): number {
  if (!n1 || !n2) return 1;
  const p = (k1 + k2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (!se) return 1;
  const z = Math.abs(k1 / n1 - k2 / n2) / se;
  // Aproximación de la normal acumulada (Abramowitz-Stegun 7.1.26)
  const t = 1 / (1 + 0.3275911 * (z / Math.SQRT2));
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-(z * z) / 2);
  return 1 - erf;
}
/** Nombres con su sigla para las filas que la tienen. */
const ETIQUETA_FILA: Record<string, string> = { 'Abrió el registro': 'Abrió el formulario (CTR del botón)', 'Se inscribió': 'Se inscribió (CVR)' };

/** En estas filas, que el número baje es bueno. */
const MENOS_ES_MEJOR = /se fue|se fueron/i;

function Real({ k1, n1, k2, n2 }: { k1: number; n1: number; k2: number; n2: number }) {
  const p = pValor(k1, n1, k2, n2);
  if (p < 0.05) return <span className="text-[11px] font-semibold text-[#0A2540] bg-[#e6f4ea] rounded px-1.5 py-0.5" title={`Probabilidad de que sea azar: ${(p * 100).toFixed(1)}%`}>real</span>;
  return <span className={`text-[11px] ${C.tenue}`} title={`Probabilidad de que sea azar: ${(p * 100).toFixed(0)}%`}>puede ser azar</span>;
}

type FilaAnuncio = DatosPanel['anuncios']['porAnuncio'][number];
type Nav = DatosCambio['antes']['navegacion'];

/** Antes / después de un mismo indicador, en % de personas. */
function FilasComparadas({ titulo, antes, despues, nAntes, nDespues }: { titulo: string; antes: Nav['acciones']; despues: Nav['acciones']; nAntes: number; nDespues: number }) {
  const nombres = [...new Set([...despues.map((x) => x.nombre), ...antes.map((x) => x.nombre)])];
  return (
    <Caja titulo={titulo}>
      <table className="w-full text-sm">
        <thead>
          <tr className={`${C.suave} text-[13px] text-right`}>
            <th className="font-medium px-1 pb-2 text-left" />
            <th className="font-medium px-2 pb-2">Antes</th>
            <th className="font-medium px-2 pb-2">Desde el cambio</th>
            <th className="font-medium px-2 pb-2">Diferencia</th>
            <th className="font-medium px-2 pb-2" title="Prueba estadística: con pocas personas, una diferencia grande todavía puede ser casualidad">¿Es real?</th>
          </tr>
        </thead>
        <tbody>
          {nombres.map((nombre) => {
            const a = antes.find((x) => x.nombre === nombre) ?? { n: 0, pct: 0 };
            const d = despues.find((x) => x.nombre === nombre) ?? { n: 0, pct: 0 };
            const dif = Math.round((d.pct - a.pct) * 10) / 10;
            const bueno = MENOS_ES_MEJOR.test(nombre) ? dif < 0 : dif > 0;
            return (
              <tr key={nombre} className="border-t border-[#eef3f6] text-right tabular-nums">
                <td className="px-1 py-2.5 text-left">{nombre}</td>
                <td className="px-2 py-2.5">
                  <Tasa valor={a.pct} base={nAntes} /> <span className={`text-xs ${C.tenue}`}>({a.n})</span>
                </td>
                <td className="px-2 py-2.5 font-medium">
                  <Tasa valor={d.pct} base={nDespues} /> <span className={`text-xs font-normal ${C.tenue}`}>({d.n})</span>
                </td>
                <td className={`px-2 py-2.5 text-xs font-medium ${!dif ? C.tenue : bueno ? 'text-[#0f7a45]' : 'text-[#b54708]'}`}>
                  {dif > 0 ? '▲' : dif < 0 ? '▼' : ''} {dif ? `${Math.abs(dif)} pts` : 'igual'}
                </td>
                <td className="px-2 py-2.5">{dif ? <Real k1={a.n} n1={nAntes} k2={d.n} n2={nDespues} /> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!nombres.length && <p className={`text-sm ${C.tenue} py-2`}>Sin datos todavía.</p>}
    </Caja>
  );
}

/** Pestaña "Desde el cambio": cómo navega la gente en la versión actual de la página frente a la anterior. */
function VistaCambio({ incluirEquipo }: { incluirEquipo: boolean }) {
  const [plataforma, setPlataforma] = useState<'todo' | 'meta' | 'tiktok'>('todo');
  const [d, setD] = useState<DatosCambio | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const cargar = async () => {
      try {
        const r = await fetch(`/api/data/cambio?equipo=${incluirEquipo ? '1' : '0'}&fuente=${plataforma}`, { cache: 'no-store' });
        if (r.status === 401) {
          window.location.href = '/data/login';
          return;
        }
        if (!r.ok) throw new Error((await r.json()).error ?? 'Error');
        setD(await r.json());
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      }
    };
    cargar();
    const id = setInterval(() => document.visibilityState === 'visible' && cargar(), 30_000);
    return () => clearInterval(id);
  }, [incluirEquipo, plataforma]);

  if (error) return <p className="text-sm text-[#b42318]">No se pudieron cargar los datos del cambio: {error}</p>;
  if (!d) return null;
  const nA = d.antes.kpis.personas;
  const nD = d.despues.kpis.personas;
  const horas = Math.round((Date.parse(d.generado) - Date.parse(d.despues.desde)) / 3_600_000);
  return (
    <Bloque n="Δ" titulo="Antes vs. después del cambio" sub="Cómo navega la gente en la versión actual frente a la versión anterior completa, en % de las personas que entraron">
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Plataforma del cambio">
        {([
          { id: 'todo', nombre: 'Todos' },
          { id: 'meta', nombre: 'Instagram y Facebook' },
          { id: 'tiktok', nombre: 'TikTok' },
        ] as const).map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={plataforma === x.id}
            onClick={() => setPlataforma(x.id)}
            className={`rounded-full px-3 py-1 text-[13px] border ${plataforma === x.id ? 'bg-[#0A2540] border-[#0A2540] text-white' : 'border-[#c3dae6] text-[#3e5260] hover:bg-[#eef6fa]'}`}
          >
            {x.nombre}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-[#FFF6D6] border-l-4 border-[#FFC300] px-4 py-3 text-sm text-[#0A2540]">
        <p className="font-extrabold">Cambio: {d.version.nombre}{plataforma !== 'todo' && ` · solo ${plataforma === 'meta' ? 'Instagram y Facebook (anuncios y orgánico)' : 'TikTok (anuncios y orgánico)'}`}</p>
        <p>
          Publicado el {fechaHora(d.despues.desde)} (hace {horas < 48 ? `${horas} h` : `${Math.round(horas / 24)} días`}). Se compara cada indicador como % de las personas que entraron: <b>antes</b> = versión
          &quot;{d.previa.nombre}&quot; ({fechaHora(d.antes.desde)} – {fechaHora(d.antes.hasta)}, {nA} personas) vs. <b>desde el cambio</b> ({nD} personas).
        </p>
        {nD < MUESTRA_MINIMA && <p className="mt-1">Todavía hay pocas personas desde el cambio: los porcentajes van a moverse mucho las primeras horas.</p>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tarjeta titulo="Llegaron al final" valor={`${d.despues.kpis.leyeronFinal}%`} ayuda={`antes ${d.antes.kpis.leyeronFinal}%`} />
        <Tarjeta titulo="Tiempo en la página" valor={d.despues.navegacion.tiempoMediano != null ? `${d.despues.navegacion.tiempoMediano} s` : '–'} ayuda={`mediana · antes ${d.antes.navegacion.tiempoMediano ?? '–'} s`} />
        <Tarjeta titulo="Abrieron el registro" valor={`${d.despues.navegacion.acciones[3].pct}%`} ayuda={`antes ${d.antes.navegacion.acciones[3].pct}%`} />
        <Tarjeta titulo="Se inscriben" valor={`${d.despues.kpis.conversion}%`} ayuda={`${d.despues.kpis.inscritos} inscritos · antes ${d.antes.kpis.conversion}%`} destacada />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <FilasComparadas titulo="¿Hasta dónde bajan?" antes={d.antes.navegacion.profundidad} despues={d.despues.navegacion.profundidad} nAntes={nA} nDespues={nD} />
        <FilasComparadas titulo="¿Qué tocan?" antes={d.antes.navegacion.acciones} despues={d.despues.navegacion.acciones} nAntes={nA} nDespues={nD} />
      </div>
      <FilasComparadas titulo="¿Desde qué sección hacen clic en «Inscríbete»?" antes={d.antes.navegacion.botones} despues={d.despues.navegacion.botones} nAntes={nA} nDespues={nD} />
      <p className={`text-xs ${C.tenue}`}>
        * Menos de {MUESTRA_MINIMA} personas: el porcentaje todavía puede cambiar mucho. «Real» = hay menos de 5% de probabilidad de que la diferencia sea casualidad. Una persona puede contar en varias filas. La versión anterior tuvo otra mezcla de anuncios, así que conviene mirar
        también los bloques de abajo, que en esta pestaña muestran solo el periodo desde el cambio.
      </p>
    </div>
    </Bloque>
  );
}

/** Comportamiento por plataforma: las mismas métricas para todos y por grupo de tráfico, con marca cuando un grupo es distinto al resto de verdad. */
function Comportamiento({ c: todo }: { c: DatosPanel['comportamiento'] }) {
  // Grupos con menos de 10 personas no dicen nada y solo agregan ruido: se ocultan (Todos siempre se muestra).
  const ver = todo.columnas.map((col, i) => i === 0 || col.personas >= 10);
  const ocultos = todo.columnas.filter((_, i) => !ver[i]).map((col) => `${col.nombre} (${col.personas})`);
  const c = { columnas: todo.columnas.filter((_, i) => ver[i]), filas: todo.filas.map((f) => ({ ...f, valores: f.valores.filter((_, i) => ver[i]) })) };
  const grupos = [...new Set(c.filas.map((f) => f.grupo))];
  const colores: Record<string, string> = Object.fromEntries(GRUPOS.map((g) => [g.id, g.color]));
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className={`${C.suave} text-[12.5px] text-right align-bottom`}>
            <th className="font-medium px-1 pb-2 text-left" />
            {c.columnas.map((col) => (
              <th key={col.nombre} className={`font-medium px-2 pb-2 whitespace-nowrap ${col.nombre === 'Todos' ? 'text-[#0A2540]' : ''}`}>
                {col.nombre !== 'Todos' && <i className="w-2 h-2 rounded-sm inline-block mr-1 align-middle" style={{ background: colores[col.nombre] }} />}
                {col.nombre === 'Instagram y Facebook orgánico' ? 'IG/FB orgánico' : col.nombre}
                <span className={`block text-[11px] font-normal ${C.tenue}`}>{col.personas} personas</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grupos.map((g) => (
            <Fragment key={g}>
              <tr>
                <td colSpan={c.columnas.length + 1} className="pt-4 pb-1 px-1 text-[12px] font-extrabold uppercase tracking-wide text-[#017FA7]">
                  {g}
                  {g === '¿Qué partes de la página ven?' && <span className={`normal-case font-normal tracking-normal ${C.tenue}`}> · de quienes tienen secciones medidas (desde el 20 oct)</span>}
                  {g === '¿Se quedan o se van?' && <span className={`normal-case font-normal tracking-normal ${C.tenue}`}> · de quienes tienen el tiempo medido</span>}
                </td>
              </tr>
              {c.filas.filter((f) => f.grupo === g).map((f) => {
                const todos = f.valores[0];
                return (
                  <tr key={f.nombre} className="border-t border-[#eef3f6] text-right tabular-nums">
                    <td className="px-1 py-2 text-left whitespace-nowrap">{ETIQUETA_FILA[f.nombre] ?? f.nombre}</td>
                    {f.valores.map((v, i) => {
                      if ('valor' in v) return <td key={i} className={`px-2 py-2 ${i === 0 ? 'font-medium' : ''}`}>{v.valor != null ? `${v.valor} s` : '–'}</td>;
                      if (!v.base) return <td key={i} className={`px-2 py-2 ${C.tenue}`}>–</td>;
                      const p = Math.round((v.n / v.base) * 1000) / 10;
                      let marca = null;
                      if (i > 0 && 'base' in todos) {
                        const restoK = todos.n - v.n, restoN = todos.base - v.base;
                        if (restoN > 0 && pValor(v.n, v.base, restoK, restoN) < 0.05) {
                          const mas = v.n / v.base > restoK / restoN;
                          const bueno = MENOS_ES_MEJOR.test(f.nombre) ? !mas : mas;
                          marca = <span className={`ml-1 text-[10px] ${bueno ? 'text-[#0f7a45]' : 'text-[#b54708]'}`} title="Distinto al resto de las personas, con menos de 5% de probabilidad de ser casualidad">{mas ? '▲' : '▼'}</span>;
                        }
                      }
                      return (
                        <td key={i} className={`px-2 py-2 whitespace-nowrap ${i === 0 ? 'font-medium' : ''}`}>
                          <Tasa valor={p} base={v.base} />
                          {marca}
                          <span className={`block text-[10.5px] font-normal ${C.tenue}`}>{v.n} de {v.base}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
      {ocultos.length > 0 && <p className={`text-xs ${C.tenue} mt-2 px-1`}>No se muestran por tener menos de 10 personas: {ocultos.join(', ')}.</p>}
    </div>
  );
}

/** Recorrido de un inscrito, cargado al pedirlo. */
function Recorrido({ id }: { id: string }) {
  const [r, setR] = useState<RecorridoInscrito | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/data/recorrido?id=${id}`, { cache: 'no-store' })
      .then(async (x) => (x.ok ? setR(await x.json()) : setError((await x.json()).error ?? 'Error')))
      .catch(() => setError('Error de conexión'));
  }, [id]);
  if (error) return <p className="text-sm text-[#b42318]">No se pudo cargar el recorrido: {error}</p>;
  if (!r) return <p className={`text-sm ${C.tenue}`}>Cargando recorrido…</p>;
  const dur = (m: number) => (m < 1 ? 'menos de 1 min' : m < 60 ? `${m} min` : m < 1440 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${Math.floor(m / 1440)} días ${Math.floor((m % 1440) / 60)} h`);
  const dato = (t: string, v: React.ReactNode) => (
    <div className="rounded-lg bg-white border border-[#e3edf2] px-3 py-2">
      <p className={`text-[11px] ${C.tenue}`}>{t}</p>
      <p className="text-sm font-semibold text-[#0A2540]">{v}</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {dato('Tardó en inscribirse', dur(r.minutosHastaInscribirse))}
        {dato('Visitas antes de inscribirse', r.visitasAntes)}
        {dato('Llegó la primera vez por', r.llegoPrimeraVez)}
        {dato('Hasta dónde bajó', r.hastaDondeBajo ? `${r.hastaDondeBajo}% de la página` : 'menos del 25%')}
        {dato('Primera visita', fechaHora(r.primeraVisita))}
      </div>
      {r.seccionesMedidas && (
        <div className="flex flex-wrap gap-1.5 items-center text-[12px]">
          <span className={C.tenue}>Secciones que vio:</span>
          {r.secciones.map((x) => (
            <span key={x.nombre} className={`rounded-full px-2 py-0.5 border ${x.vio ? 'bg-[#e7f6fb] border-[#9fd6e8] text-[#0A2540]' : 'border-[#e3edf2] text-[#9aa9b3] line-through'}`}>{x.nombre}</span>
          ))}
        </div>
      )}
      <ol className="border-l-2 border-[#d9e8f0] ml-1 space-y-1.5 max-h-80 overflow-y-auto pr-2">
        {r.pasos.map((x, n) => (
          <li key={n} className={`pl-3 text-[13px] relative ${x.despues ? 'opacity-60' : ''}`}>
            <i className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${x.que === 'Se inscribió' ? 'bg-[#0f9d58]' : x.que === 'Entró a la página' ? 'bg-[#017FA7]' : 'bg-[#b9c9d3]'}`} />
            <span className={`tabular-nums ${C.tenue} mr-2`}>{fechaHora(x.t)}</span>
            <span className={x.que === 'Se inscribió' ? 'font-semibold text-[#0f9d58]' : x.que === 'Entró a la página' ? 'font-medium' : ''}>{x.que}</span>
            {x.detalle && <span className={C.tenue}> · {x.detalle}</span>}
            {x.despues && <span className={`text-[11px] ${C.tenue}`}> (después de inscribirse)</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

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
            <th className={th} title="La mitad estuvo menos que esto y la otra mitad, más">Tiempo típico</th>
            <th className={th} title="Abrieron el formulario de la lista de espera">Abrieron el formulario</th>
            <th className={th} title="De cada 100 personas, cuántas hicieron clic en «Inscríbete»">CTR del botón</th>
            <th className={th}>Inscritos</th>
            <th className={th} title="De cada 100 personas, cuántas se inscribieron">Se inscriben (CVR)</th>
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
              <td className="px-2 py-2.5 text-right tabular-nums">{f.personas ? <Tasa valor={Math.round((f.registro / f.personas) * 1000) / 10} base={f.personas} /> : '–'}</td>
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
  const [verCambio, setVerCambio] = useState(false);
  const [vistaAnuncios, setVistaAnuncios] = useState<'porAnuncio' | 'porUbicacion' | 'porConjunto' | 'porCampana'>('porAnuncio');
  const [plataformaAnuncios, setPlataformaAnuncios] = useState<'Meta' | 'TikTok' | 'Otros'>('Meta');
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());
  const [revelados, setRevelados] = useState<Record<string, { name: string; email: string; whatsapp: string; whatsapp_country_code: string }>>({});
  const [nuevos, setNuevos] = useState<Set<string>>(new Set());
  const vistos = useRef<Set<string> | null>(null);
  // Cuándo apareció cada movimiento: los nuevos quedan resaltados 20 segundos
  const movVistos = useRef<Map<string, number> | null>(null);
  const [movNuevos, setMovNuevos] = useState<Set<string>>(new Set());

  // En "Desde el cambio" todo el tablero muestra el periodo de la versión actual.
  const idCambio = versiones[versiones.length - 1].id;
  const periodo = opciones.find((p) => p.id === (verCambio ? idCambio : periodoId)) ?? opciones.find((p) => p.id === periodoId)!;

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

  // Lecturas en lenguaje simple (solo con datos suficientes para que no engañen)
  const BASE = MUESTRA_MINIMA;
  const insc = (n: number) => (n === 1 ? '1 inscrito' : `${n} inscritos`);
  const n100 = (x: number) => (x < 1 && x > 0 ? 'menos de 1' : String(Math.round(x * 10) / 10));
  const ideas: string[] = [];
  const resOrigen: string[] = [];
  const resPagina: string[] = [];
  const resPlataformas: string[] = [];
  const resAnuncios: string[] = [];
  if (datos && total > 0) {
    // Cómo vamos
    ideas.push(`Entraron ${total} personas y se inscribieron ${k!.inscritos}: de cada 100 personas, se inscriben ${n100(k!.conversion)}.`);
    const traf = datos.trafico.filter((t) => t.personas > 0).sort((x, y) => y.personas - x.personas);
    if (traf[0]) ideas.push(`La mayoría llega por ${traf[0].nombre} (${Math.round(traf[0].pctPersonas)}% de las personas).`);
    const conBaseT = traf.filter((t) => t.personas >= BASE).sort((x, y) => y.tasa - x.tasa);
    if (conBaseT.length > 1) ideas.push(`Donde mejor funciona: ${conBaseT[0].nombre} (se inscriben ${n100(conBaseT[0].tasa)} de cada 100). Donde peor: ${conBaseT[conBaseT.length - 1].nombre} (${n100(conBaseT[conBaseT.length - 1].tasa)} de cada 100).`);
    if (!k!.inscritos) ideas.push('Todavía no hay inscritos en este periodo.');
    // De dónde viene
    if (traf[0]) resOrigen.push(`${traf[0].nombre} trae ${Math.round(traf[0].pctPersonas)}% de la gente.`);
    for (const t of conBaseT) resOrigen.push(`${t.nombre}: ${t.personas} personas, ${insc(t.inscritos)} (${n100(t.tasa)} de cada 100).`);
    const tiktokSinNombre = datos.anuncios.porAnuncio.find((f) => f.plataforma === 'TikTok' && f.nombre.includes('falta utm_content'));
    if (tiktokSinNombre?.personas) resOrigen.push(`${tiktokSinNombre.personas} personas de TikTok no tienen el nombre de su anuncio (llegaron antes del 20 oct, 11:45, o por anuncios que faltan corregir).`);
    // Qué hace en la página
    let peor = { i: 0, p: -1 };
    embudo.forEach((_, i) => {
      const p = caida(i, 'todos');
      if (p != null && p > peor.p) peor = { i, p };
    });
    if (peor.p > 0) resPagina.push(`El paso donde más gente se pierde es «${embudo[peor.i].nombre.toLowerCase()}»: no llega ${peor.p}% de quienes estaban en el paso anterior.`);
    resPagina.push(`${datos.interacciones[0].pct}% llega al final de la página y la mitad de la gente se queda ${k!.tiempoMediano ?? '–'} segundos o menos.`);
    const nav = datos.navegacion;
    if (nav.personasConSecciones >= 10) {
      let peorS = { i: 0, c: -1 };
      nav.secciones.forEach((x, i) => {
        const ant = nav.secciones[i - 1];
        if (i > 0 && ant.n) {
          const c = Math.round(((ant.n - x.n) / ant.n) * 100);
          if (c > peorS.c) peorS = { i, c };
        }
      });
      if (peorS.c > 0) resPagina.push(`En la página, el salto que más gente pierde es de «${nav.secciones[peorS.i - 1].nombre}» a «${nav.secciones[peorS.i].nombre}» (se va ${peorS.c}%).`);
    }
    // Cada plataforma
    const c = datos.comportamiento;
    const fila = (nombre: string) => c.filas.find((f) => f.nombre === nombre)?.valores ?? [];
    const pctDe = (v: (typeof c.filas)[number]['valores'][number] | undefined) => (v && 'base' in v && v.base ? Math.round((v.n / v.base) * 1000) / 10 : null);
    c.columnas.forEach((col, i) => {
      if (i === 0 || col.personas < BASE) return;
      const reb = pctDe(fila('Se fueron en menos de 5 s')[i]);
      const tiempo = fila('Tiempo típico en la página')[i];
      const fin = pctDe(fila('Llegó al final')[i]);
      const ins = pctDe(fila('Se inscribió')[i]);
      resPlataformas.push(
        `${col.nombre}: ${reb != null ? `${reb}% se va en menos de 5 s, ` : ''}${tiempo && 'valor' in tiempo && tiempo.valor != null ? `la mitad se queda ${tiempo.valor} s o menos, ` : ''}${fin ?? '–'}% llega al final y ${n100(ins ?? 0)} de cada 100 se inscriben.`,
      );
    });
  }
  if (datos) {
    const lista = (plataformaAnuncios === 'Otros' ? datos.anuncios.otros : datos.anuncios.porAnuncio.filter((f) => f.plataforma === plataformaAnuncios)).filter((f) => !f.nombre.includes('falta utm_content'));
    const conBaseA = lista.filter((f) => f.personas >= 10);
    const mejor = [...conBaseA].sort((x, y) => y.tasa - x.tasa || y.final - x.final)[0];
    const masGente = [...lista].sort((x, y) => y.personas - x.personas)[0];
    if (mejor && mejor.inscritos) resAnuncios.push(`El que mejor convierte es «${mejor.nombre}»: de ${mejor.personas} personas, se inscribieron ${mejor.inscritos} (${n100(mejor.tasa)} de cada 100).`);
    if (masGente && masGente.personas && masGente !== mejor) resAnuncios.push(`El que más gente trae es «${masGente.nombre}» (${masGente.personas} personas, ${insc(masGente.inscritos)}).`);
    for (const f of lista.filter((x) => x.personas >= BASE && !x.inscritos).slice(0, 2)) resAnuncios.push(`«${f.nombre}» trajo ${f.personas} personas y ninguna se inscribió todavía.`);
  }

  const campo = 'rounded-lg border border-white/20 bg-white text-[#0A2540] px-3 py-2 text-sm';
  const VISTAS = [
    { id: 'porAnuncio', nombre: 'Anuncio', boton: 'Por anuncio' },
    { id: 'porUbicacion', nombre: 'Dónde se mostró', boton: 'Por ubicación' },
    { id: 'porConjunto', nombre: 'Conjunto / grupo', boton: 'Por conjunto' },
    { id: 'porCampana', nombre: 'Campaña', boton: 'Por campaña' },
  ] as const;
  const otros = plataformaAnuncios === 'Otros';
  const filasAnuncios = otros ? (datos?.anuncios.otros ?? []) : (datos?.anuncios[vistaAnuncios] ?? []).filter((f) => f.plataforma === plataformaAnuncios);
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
          {verCambio && <span className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white">Desde el cambio · {fechaHora(periodo.desde)}</span>}
          <select hidden={verCambio} value={periodoId} onChange={(e) => setPeriodoId(e.target.value)} className={campo} aria-label="Periodo">
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
            { id: 'cambio', nombre: `Desde el cambio (${versiones.length > 1 ? diaCorto(new Date(versiones[versiones.length - 1].desde).toLocaleDateString('en-CA', { timeZone: 'America/Lima' })) : '–'})` },
          ] as const).map((t) => {
            const activa = t.id === 'cambio' ? verCambio : !verCambio && fuente === t.id;
            return (
            <button
              key={t.id}
              role="tab"
              aria-selected={activa}
              onClick={() => {
                if (t.id === 'cambio') {
                  setVerCambio(true);
                  setFuente('todo');
                  setPlataformaAnuncios('Meta');
                  return;
                }
                setVerCambio(false);
                setFuente(t.id);
                setPlataformaAnuncios(t.id === 'tiktok' ? 'TikTok' : 'Meta');
              }}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-[3px] -mb-px ${activa ? 'border-[#017FA7] text-[#0A2540]' : 'border-transparent text-[#5b6f7d] hover:text-[#0A2540]'}`}
            >
              {t.nombre}
            </button>
            );
          })}
        </div>
        <div role="navigation" aria-label="Ir a" className="max-w-6xl mx-auto px-4 pb-2 flex items-center gap-1.5 overflow-x-auto text-[12.5px]">
          <span className={`${C.tenue} shrink-0`}>Ir a:</span>
          {SECCIONES_PANEL.map((x) => (
            <a key={x.id} href={`#${x.id}`} className="shrink-0 rounded-full border border-[#c3dae6] bg-white px-2.5 py-0.5 text-[#0A2540] hover:bg-[#eef6fa] whitespace-nowrap">
              {x.nombre}
            </a>
          ))}
        </div>
      </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        {error && <p className="text-sm text-[#b42318]">No se pudieron cargar los datos: {error}</p>}

        <Guia />

        {/* Cómo vamos + actividad en vivo */}
        <section id="resumen" className="space-y-3 scroll-mt-48">
        <div>
          <h2>¿Cómo vamos?</h2>
          <p className={`text-sm ${C.suave}`}>{verCambio ? 'Desde el cambio de la página' : periodo.nombre} · los números grandes y lo más importante en pocas palabras</p>
        </div>
        <div className="grid lg:grid-cols-5 gap-4 items-start">
        <div className="space-y-3 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3">
            <Tarjeta titulo="Personas que entraron" valor={k ? String(k.personas) : '–'} ayuda="cada celular o computadora cuenta una vez">
              {k && <Cambio ahora={k.personas} antes={a?.personas} />}
            </Tarjeta>
            <Tarjeta titulo="Llegaron por un anuncio" valor={k ? String(k.deAnuncios) : '–'} ayuda={k && total ? `${Math.round((k.deAnuncios / total) * 100)}% del total` : 'personas que hicieron clic'}>
              {k && <Cambio ahora={k.deAnuncios} antes={a?.deAnuncios} />}
            </Tarjeta>
            <Tarjeta titulo="Se inscribieron" valor={k ? String(k.inscritos) : '–'} ayuda="dejaron sus datos en la lista de espera" destacada>
              {k && <Cambio ahora={k.inscritos} antes={a?.inscritos} />}
            </Tarjeta>
            <Tarjeta titulo="Tasa de inscripción (CVR)" valor={k ? `${k.conversion}%` : '–'} ayuda={k ? `de cada 100 personas, se inscriben ${n100(k.conversion)}` : 'de cada 100 personas'}>
              {k && <Cambio ahora={k.conversion} antes={a?.conversion} puntos />}
            </Tarjeta>
          </div>
          {ideas.length > 0 && (
            <div className="rounded-2xl bg-[#FFF6D6] border-l-4 border-[#FFC300] px-4 py-3">
              <p className="text-[13px] font-extrabold text-[#0A2540] mb-1">Lo más importante</p>
              <ul className="text-sm text-[#0A2540] space-y-0.5 list-disc pl-5">
                {ideas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
            <Caja titulo="Qué está pasando ahora (cada fila es algo que hizo una persona)" className="lg:col-span-2">
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
        </section>

        {verCambio && <VistaCambio incluirEquipo={incluirEquipo} />}

        <Bloque n={1} id="origen" titulo="¿De dónde viene la gente?" sub="Cuántas personas entran cada día y por qué plataforma llegan" resumen={resOrigen}>
          <Caja>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
              {GRUPOS.map((g) => {
                const t = datos?.trafico.find((x) => x.nombre === g.id);
                return (
                  <div key={g.id} className="rounded-xl border border-[#e3edf2] px-3 py-2.5" style={{ borderTop: `4px solid ${g.color}` }}>
                    <p className={`text-[12px] font-medium ${C.suave}`}>{g.id}</p>
                    <p className="text-xl font-extrabold tabular-nums text-[#0A2540]">
                      {t?.personas ?? '–'} <span className={`text-[11.5px] font-medium ${C.tenue}`}>personas</span>
                    </p>
                    <dl className="mt-1 text-[11.5px] leading-snug grid grid-cols-[auto_1fr] gap-x-2 text-[#0A2540]">
                      {t && (
                        <>
                          <dt className={C.tenue}>Del total</dt>
                          <dd className="text-right tabular-nums">{t.pctPersonas}%</dd>
                          <dt className={C.tenue}>Inscritos</dt>
                          <dd className="text-right tabular-nums">{t.inscritos}</dd>
                          <dt className={C.tenue} title="De cada 100 personas, cuántas se inscriben">Se inscriben (CVR)</dt>
                          <dd className="text-right tabular-nums">{t.personas > 0 ? <Tasa valor={t.tasa} base={t.personas} /> : '–'}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                );
              })}
            </div>
            <div className="flex items-end gap-1.5 sm:gap-2 h-48">
              {datos?.porDia.map((d) => {
                const visibles = GRUPOS.filter((g) => d.plataformas[g.id]);
                return (
                  <div key={d.fecha} className="flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${d.personas} personas: ${GRUPOS.map((g) => `${d.plataformas[g.id]} ${g.corto}`).join(', ')} · ${d.inscritos} inscritos`}>
                    <span className="text-xs tabular-nums text-[#3b4b56]">{d.personas}</span>
                    <div className="w-full max-w-9 flex flex-col-reverse justify-start rounded-t overflow-hidden" style={{ height: `${(d.personas / maxDia) * 100}%` }}>
                      {visibles.map((g) => (
                        <div key={g.id} className="w-full" style={{ background: g.color, height: `${d.personas ? (d.plataformas[g.id] / d.personas) * 100 : 0}%` }} />
                      ))}
                    </div>
                    <span className={`text-[11px] ${C.tenue} mt-1 truncate w-full text-center`}>{diaCorto(d.fecha)}</span>
                  </div>
                );
              })}
              {datos && !datos.porDia.length && <p className={`text-sm ${C.tenue}`}>Sin visitas en este periodo</p>}
            </div>
            <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${C.suave} mt-3`}>
              {GRUPOS.map((g) => (
                <span key={g.id} className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm inline-block" style={{ background: g.color }} /> {g.id === 'Otros' ? 'Otros (directo, web, WhatsApp, Google…)' : g.id}</span>
              ))}
            </div>
            <div className="overflow-x-auto -mx-1 mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px] text-right`}>
                    <th className="font-medium px-1 pb-2 text-left">Día</th>
                    <th className="font-medium px-2 pb-2">Personas</th>
                    {GRUPOS.map((g) => (
                      <th key={g.id} className="font-medium px-2 pb-2 whitespace-nowrap">
                        <i className="w-2 h-2 rounded-sm inline-block mr-1 align-middle" style={{ background: g.color }} />
                        {g.corto}
                      </th>
                    ))}
                    <th className="font-medium px-2 pb-2">Inscritos</th>
                    <th className="font-medium px-2 pb-2">Conversión</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(datos?.porDia ?? [])].reverse().map((d) => (
                    <tr key={d.fecha} className="border-t border-[#eef3f6] text-right tabular-nums">
                      <td className="px-1 py-2 text-left whitespace-nowrap">{diaCorto(d.fecha)}</td>
                      <td className="px-2 py-2 font-medium">{d.personas}</td>
                      {GRUPOS.map((g) => (
                        <td key={g.id} className={`px-2 py-2 ${d.plataformas[g.id] ? '' : C.tenue}`}>{d.plataformas[g.id]}</td>
                      ))}
                      <td className={`px-2 py-2 ${d.inscritos ? 'text-[#0f9d58] font-medium' : ''}`}>{d.inscritos}</td>
                      <td className="px-2 py-2"><Tasa valor={d.tasa} base={d.personas} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Caja>
        </Bloque>

        <Bloque n={2} id="pagina" titulo="¿Qué hace la gente en la página?" sub="De cada 100 personas que entran, cuántas avanzan en cada paso y hasta qué parte de la página llegan" resumen={resPagina}>
          <Caja>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px]`}>
                    <th className="font-medium px-1 pb-2 text-left">Paso</th>
                    <th className="font-medium px-2 pb-2 text-left w-[40%]">Todos</th>
                    <th className="font-medium px-2 pb-2 text-right">Llegaron por anuncio</th>
                    <th className="font-medium px-2 pb-2 text-right">Llegaron sin anuncio</th>
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
            {embudo.length === 4 && (
              <div className="grid sm:grid-cols-3 gap-2 mt-4">
                {[
                  { t: 'CTR del botón «Inscríbete»', d: 'abrieron el formulario ÷ entraron', k: embudo[2], b: embudo[0] },
                  { t: 'CVR del formulario', d: 'se inscribieron ÷ abrieron el formulario', k: embudo[3], b: embudo[2] },
                  { t: 'CVR total (tasa de inscripción)', d: 'se inscribieron ÷ entraron', k: embudo[3], b: embudo[0] },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-[#e3edf2] px-3 py-2.5">
                    <p className={`text-[12px] font-medium ${C.suave}`}>{x.t}</p>
                    <p className="text-xl font-extrabold tabular-nums text-[#0A2540]">
                      {x.b.todos.n ? <Tasa valor={Math.round((x.k.todos.n / x.b.todos.n) * 1000) / 10} base={x.b.todos.n} /> : '–'}
                    </p>
                    <p className={`text-[11.5px] ${C.tenue}`}>
                      {x.d} · {x.k.todos.n} de {x.b.todos.n}
                    </p>
                    <p className={`text-[11.5px] ${C.tenue}`}>
                      Por anuncio: {x.b.anuncios.n ? `${Math.round((x.k.anuncios.n / x.b.anuncios.n) * 1000) / 10}%` : '–'} · Sin anuncio: {x.b.organico.n ? `${Math.round((x.k.organico.n / x.b.organico.n) * 1000) / 10}%` : '–'}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-[#eef3f6]">
              <p className={`text-[13px] font-medium ${C.suave}`}>¿Hasta qué sección llegan?</p>
              <p className={`text-xs ${C.tenue} mb-3`}>
                De las {datos?.navegacion.personasConSecciones ?? '–'} personas con secciones medidas (se mide desde el 20 oct), cuántas vieron cada parte de la página, en el orden en que aparecen.
              </p>
              {datos && datos.navegacion.personasConSecciones > 0 ? (
                <ul className="space-y-2">
                  {datos.navegacion.secciones.map((x, i, l) => {
                    const c = i > 0 && l[i - 1].n ? Math.round(((l[i - 1].n - x.n) / l[i - 1].n) * 100) : null;
                    return (
                      <li key={x.nombre} className="flex items-center gap-2 text-sm">
                        <span className="w-40 shrink-0 truncate">{x.nombre}</span>
                        <div className="flex-1 h-3 rounded bg-[#eef3f6] min-w-16">
                          <div className="h-3 rounded" style={{ background: AZUL, width: `${Math.max(x.pct, x.n ? 1 : 0)}%` }} />
                        </div>
                        <span className="tabular-nums whitespace-nowrap w-24 text-right">
                          <b className="font-medium">{x.n}</b> <span className={C.tenue}>· <Tasa valor={x.pct} base={datos.navegacion.personasConSecciones} /></span>
                        </span>
                        <span className="text-xs text-[#b54708] tabular-nums w-11 text-right">{c != null && c > 0 ? `−${c}%` : ''}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`text-sm ${C.tenue}`}>Todavía no hay visitas con secciones medidas en este periodo.</p>
              )}
            </div>
          </Caja>
        </Bloque>

        <Bloque n={3} id="plataformas" titulo="¿Cómo se comporta la gente de cada plataforma?" sub="Las mismas medidas, separadas según por dónde llegó cada persona. Así se ve qué plataforma trae gente que lee y cuál trae clics que se van" resumen={resPlataformas}>
          <Caja>
            {datos ? <Comportamiento c={datos.comportamiento} /> : <p className={`text-sm ${C.tenue}`}>Cargando…</p>}
            <p className={`text-xs ${C.tenue} mt-3`}>
              * Menos de {MUESTRA_MINIMA} personas: el porcentaje todavía puede cambiar mucho. «Se fueron en menos de 5 s» = salieron sin llegar al 25% de la página. El avance del video se mide desde el 20 oct y solo
              con el sonido activado.
            </p>
          </Caja>
        </Bloque>

        <Bloque n={4} id="anuncios" titulo={fuente === 'meta' ? '¿Qué anuncios de Meta funcionan mejor?' : fuente === 'tiktok' ? '¿Qué anuncios de TikTok funcionan mejor?' : '¿Qué anuncios funcionan mejor?'} sub="Qué hace la gente que llega por cada anuncio. Cada persona cuenta en el primer anuncio en que hizo clic. «Otros» es la gente que llegó sin anuncio" resumen={resAnuncios}>
          <Caja>
            {fuente === 'todo' && <div className="flex flex-wrap items-center gap-1.5 mb-2" role="tablist" aria-label="Plataforma">
              {(['Meta', 'TikTok', 'Otros'] as const).map((p) => {
                const personas = p === 'Otros' ? datos?.embudo[0]?.organico.n : datos?.porPlataforma.find((x) => x.nombre === p)?.personas;
                return (
                  <button key={p} role="tab" aria-selected={plataformaAnuncios === p} onClick={() => setPlataformaAnuncios(p)} className={boton(plataformaAnuncios === p)}>
                    {p}
                    {personas != null && <span className="opacity-70"> · {personas}</span>}
                  </button>
                );
              })}
            </div>}
            {!otros && <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Agrupar por">
              {VISTAS.map((v) => (
                <button key={v.id} role="tab" aria-selected={vistaAnuncios === v.id} onClick={() => setVistaAnuncios(v.id)} className={boton(vistaAnuncios === v.id)}>
                  {v.boton}
                </button>
              ))}
            </div>}
            {otros && <div className="mb-4" />}
            {!otros && vistaAnuncios === 'porUbicacion' && (
              <p className={`text-xs ${C.suave} mb-3`}>
                Dónde la plataforma mostró el anuncio. WhatsApp Estados, Historias de Instagram, Reels, etc. son espacios <b>pagados</b> de Meta: esas personas vieron un anuncio, no algo que compartimos.
              </p>
            )}
            <TablaAnuncios
              filas={filasAnuncios}
              etiqueta={otros ? 'Canal' : VISTAS.find((v) => v.id === vistaAnuncios)!.nombre}
              verPlataforma={false}
            />
            {plataformaAnuncios === 'TikTok' && filasAnuncios.some((f) => f.nombre.includes('falta utm_content')) && (
              <p className="text-xs text-[#b54708] mt-3">
                «Sin nombre de anuncio»: personas que llegaron antes del 20 oct a las 11:45, cuando los links de TikTok aún no traían el nombre del anuncio
                (no se puede recuperar), o por los anuncios cuyo link todavía no se pudo corregir (Delivery 1, Esconderte 2, Ropa Favorita 1, Playa 2 y Bikini 1:
                TikTok no deja editarlos hasta reemplazar su música vencida). Desde la corrección, cada persona aparece con su anuncio.
              </p>
            )}
            <p className={`text-xs ${C.tenue} mt-3`}>
              * Menos de {MUESTRA_MINIMA} personas: el porcentaje todavía puede cambiar mucho. Todo se mide en la página; el nombre de cada anuncio viene del utm_content de su link.
              {datos && datos.calidad.robots > 0 && ` Se excluyeron ${datos.calidad.robots} visitas de robots de revisión de anuncios (clics desde fuera de Perú o con el link sin completar).`}
            </p>
          </Caja>
        </Bloque>

        <Bloque n={5} id="inscritos" titulo={`Personas inscritas${k ? ` (${k.inscritos})` : ''}`} sub={`Quiénes se inscribieron. «Recorrido» muestra paso a paso qué hizo cada persona hasta inscribirse; «Ver», su contacto completo${datos && datos.inscritos.length !== k?.inscritos ? `. Hay ${datos.inscritos.length} registros porque alguien se inscribió más de una vez (en los totales cuenta una sola vez)` : ''}`}>
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
                    const abierto = abiertos.has(i.id);
                    return (
                      <Fragment key={i.id}>
                      <tr className={`border-t border-[#eef3f6] ${nuevos.has(i.id) ? 'bg-[#e9f7ef]' : ''}`}>
                        <td className="px-1 py-2.5 whitespace-nowrap">{fechaHora(i.fecha)}</td>
                        <td className="px-1 py-2.5">
                          {c ? c.name : i.nombre}
                          {i.equipo && <span className={`ml-1 text-[11px] ${C.tenue}`}>(equipo)</span>}
                          {i.veces > 1 && <span className="ml-1 text-[11px] rounded bg-[#FFF6D6] px-1.5 py-0.5 text-[#0A2540]" title="La misma persona se registró más de una vez; en los totales cuenta una sola vez">se inscribió {i.veces} veces</span>}
                        </td>
                        <td className="px-1 py-2.5">{c ? c.email : i.correo}</td>
                        <td className="px-1 py-2.5 whitespace-nowrap">{c ? `${c.whatsapp_country_code ?? ''} ${c.whatsapp ?? ''}` : i.whatsapp}</td>
                        <td className="px-1 py-2.5">{i.pais}</td>
                        <td className="px-1 py-2.5">{i.anuncio ? `Anuncio: ${i.anuncio}` : i.fuente}</td>
                        <td className="px-1 py-2.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setAbiertos((x) => { const n = new Set(x); if (n.has(i.id)) n.delete(i.id); else n.add(i.id); return n; })}
                            aria-expanded={abierto}
                            className={`rounded-md border px-2 py-0.5 text-[13px] mr-1 ${abierto ? 'bg-[#0A2540] border-[#0A2540] text-white' : 'border-[#cbd6dd] text-[#017FA7] hover:bg-[#f4f7f9]'}`}
                          >
                            Recorrido
                          </button>
                          {!c && (
                            <button onClick={() => revelar(i.id)} className="rounded-md border border-[#cbd6dd] px-2 py-0.5 text-[13px] text-[#017FA7] hover:bg-[#f4f7f9]">
                              Ver
                            </button>
                          )}
                        </td>
                      </tr>
                      {abierto && (
                        <tr className="bg-[#F5FAFC]">
                          <td colSpan={7} className="px-3 py-3">
                            <Recorrido id={i.id} />
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {datos && !datos.inscritos.length && <p className={`text-sm ${C.tenue} px-1 py-3`}>Todavía no hay inscritos en este periodo.</p>}
            </div>
          </Caja>
        </Bloque>

        <Bloque n={6} id="detalle" titulo="Más detalle" sub="Para revisar a fondo: el canal exacto por el que llegó cada persona, países, dispositivos y la calidad de la medición">
          <details className="group space-y-3">
            <summary className="cursor-pointer text-sm font-semibold text-[#017FA7] mb-3">Mostrar más detalle</summary>
            <div className="space-y-4">
              <p className={`text-[13px] font-medium ${C.suave}`}>Canal exacto de llegada</p>
          <Caja>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${C.suave} text-[13px] text-right`}>
                    <th className="font-medium px-1 pb-2 text-left">Canal</th>
                    <th className="font-medium px-2 pb-2">Personas</th>
                    <th className="font-medium px-2 pb-2">Llegaron al final</th>
                    <th className="font-medium px-2 pb-2">Abrieron el formulario</th>
                    <th className="font-medium px-2 pb-2">Inscritos</th>
                    <th className="font-medium px-2 pb-2">Se inscriben (CVR)</th>
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
                  <li>{datos?.calidad.robots ?? '–'} robots de revisión de Meta y TikTok excluidos</li>
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
            </div>
          </details>
        </Bloque>

        <div className={`text-xs ${C.tenue} border-t border-[#e1e8ec] pt-4 pb-8 flex flex-wrap gap-x-4 gap-y-1`}>
          <span>Datos de Supabase: visitas, eventos y lista de espera de entrenaciencia.com/neurociencia.</span>
          <span>Persona = un dispositivo o navegador.</span>
          {datos && (datos.anterior.completo ? (
            <span>«vs. periodo anterior» compara con {fechaHora(datos.anterior.desde)} – {fechaHora(datos.anterior.hasta)}.</span>
          ) : (
            <span>Sin comparación con el periodo anterior: empezaría antes de la lista de espera (11 oct) y saldría engañosa.</span>
          ))}
        </div>
      </main>
    </div>
  );
}
