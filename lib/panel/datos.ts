import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Lectura de datos para el panel privado. Solo se usa en el servidor (route handlers del panel),
// con la clave service_role, porque las tablas solo permiten INSERT al público.

export const RECURSO_LANDING = 'Landing Curso VSL';
export const FUENTE_LISTA = 'Lista de espera ECC';

/** Versiones publicadas de la landing (hora de Lima). Agregar una fila por cada cambio grande. */
export const VERSIONES = [
  { id: 'v1', nombre: 'Reserva por US$5', desde: '2026-10-07T00:00:00-05:00' },
  { id: 'v2', nombre: 'Lista de espera gratis', desde: '2026-10-11T19:06:00-05:00' },
];

/** Navegadores del equipo (prefijo del anonymous_id). PANEL_EQUIPO en Vercel agrega más, separados por coma. */
const EQUIPO_POR_DEFECTO = ['f8f31a93', '55d42401', '99e26533', 'a39bc8d4'];
const DOMINIO_DEMO = 'vercel.app';

/**
 * Países a los que apuntan los anuncios (código ISO). Un clic de anuncio desde otro país es el robot
 * de revisión de Meta (entra desde EE.UU., Irlanda, Suecia… con navegadores simulados), no una persona.
 * PANEL_PAISES_ANUNCIOS en Vercel reemplaza la lista, separados por coma.
 */
const PAISES_ANUNCIOS_POR_DEFECTO = ['PE'];

function lista(env: string | undefined, porDefecto: string[]): string[] {
  const extra = (env ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return extra.length ? extra : porDefecto;
}
const equipo = () => [...EQUIPO_POR_DEFECTO, ...lista(process.env.PANEL_EQUIPO, [])];
const paisesAnuncios = () => lista(process.env.PANEL_PAISES_ANUNCIOS, PAISES_ANUNCIOS_POR_DEFECTO).map((p) => p.toUpperCase());

let cliente: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return cliente;
}

export type Fila = Record<string, unknown>;

/** Trae todas las filas (Supabase devuelve como máximo 1000 por consulta). */
async function todas(
  tabla: string,
  columnas: string,
  filtro: (q: any) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<Fila[]> {
  const filas: Fila[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await filtro(db().from(tabla).select(columnas)).order('created_at').range(desde, desde + 999);
    if (error) throw new Error(`${tabla}: ${error.message}`);
    filas.push(...(data as Fila[]));
    if (!data || data.length < 1000) return filas;
  }
}

const LIMA = 'America/Lima';
const diaLima = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: LIMA });
const s = (v: unknown) => (typeof v === 'string' ? v : '');
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/** Meta a veces manda las etiquetas codificadas ("Playa+-+1", "%7C"). */
export function limpiar(v: unknown): string {
  const t = s(v);
  if (!t) return '';
  try {
    return decodeURIComponent(t.replace(/\+/g, ' ')).replace(/\s+/g, ' ').trim();
  } catch {
    return t.replace(/\+/g, ' ').trim();
  }
}

function dispositivo(ua: string, path: string): string {
  if (path.includes('movil')) return 'Celular';
  if (path.includes('escritorio')) return 'Computadora';
  return /iphone|android.*mobile|mobile/i.test(ua) ? 'Celular' : 'Computadora';
}

/**
 * ¿La visita vino de un anuncio de Meta? Los anuncios llevan en utm_source la ubicación
 * ({{placement}}: Instagram_Reels, Facebook_Mobile_Feed, Whatsapp_Status, Others…) y el nombre
 * del anuncio en utm_content. El link de la bio ("ig" / link_in_bio) es orgánico.
 */
export function esAnuncio(v: Fila): boolean {
  const src = limpiar(v.utm_source);
  return /^(facebook|instagram|messenger|whatsapp|audience|threads|others?)(_|$)/i.test(src) && Boolean(limpiar(v.utm_content));
}

/** Nombre legible de la ubicación del anuncio. */
function ubicacion(src: string): string {
  const t = src.replace(/_/g, ' ').toLowerCase();
  if (t === 'others' || t === 'other') return 'Otras ubicaciones';
  return t.replace(/\bmobile\b/g, '').replace(/\s+/g, ' ').trim().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Canal de llegada de una visita. Prioridad: anuncio de Meta → etiqueta UTM → app desde la que se abrió
 * (navegador interno de Instagram/TikTok/Facebook) → sitio de procedencia → link directo.
 */
export function canal(v: Fila): string {
  if (esAnuncio(v)) return 'Anuncios Meta';
  const t = (x: unknown) => limpiar(x).toLowerCase();
  const utm = t(v.utm_source) || t(v.first_touch_utm_source);
  const ua = t(v.user_agent);
  let host = '';
  try {
    host = new URL(String(v.referrer ?? '')).hostname.replace(/^www\./, '').toLowerCase();
  } catch {}
  const es = (utms: string[], hosts: RegExp, uas?: RegExp) =>
    utms.some((u) => utm === u || utm.startsWith(u)) || hosts.test(host) || (uas ? uas.test(ua) : false);
  if (es(['ig', 'instagram'], /(^|\.)instagram\.com$/, /instagram/)) return 'Instagram orgánico';
  if (es(['tiktok', 'tt'], /(^|\.)tiktok\.com$/, /tiktok|musical_ly|bytedance/)) return 'TikTok';
  if (es(['fb', 'facebook', 'meta'], /(^|\.)(facebook\.com|fb\.com|fb\.me)$/, /fban|fbav/)) return 'Facebook orgánico';
  if (es(['wa', 'whatsapp'], /(^|\.)(whatsapp\.com|wa\.me)$/, /whatsapp/)) return 'WhatsApp';
  if (es(['yt', 'youtube'], /(^|\.)(youtube\.com|youtu\.be)$/)) return 'YouTube';
  if (es(['google'], /(^|\.)google\./)) return 'Google';
  if (es(['email', 'correo', 'newsletter'], /mail\./)) return 'Correo';
  if (utm) return `Otro (${utm})`;
  if (host === 'entrenaciencia.com') return 'Web entrenaciencia.com';
  if (host.endsWith('vercel.app')) return 'Link de demo';
  if (host) return `Otro sitio (${host})`;
  return 'Link directo';
}

function ocultarCorreo(c: string): string {
  const [u, d] = c.split('@');
  if (!d) return '***';
  return `${u.slice(0, 1)}***@${d}`;
}
function ocultarTelefono(t: string): string {
  const n = t.replace(/\s+/g, '');
  return n.length <= 3 ? '***' : `${'*'.repeat(Math.max(3, n.length - 3))}${n.slice(-3)}`;
}
function ocultarNombre(n: string): string {
  const partes = n.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[1][0]}.` : partes[0] ?? '';
}

function contar(valores: string[]): { nombre: string; n: number }[] {
  const m = new Map<string, number>();
  for (const v of valores) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n);
}

function mediana(xs: number[]): number | null {
  if (!xs.length) return null;
  const o = [...xs].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : Math.round((o[m - 1] + o[m]) / 2);
}

export type Filtros = { desde: string; hasta: string; incluirEquipo: boolean };

async function leerRango(desde: string, hasta: string) {
  // Solo en desarrollo: PANEL_FIXTURE apunta a un JSON con { visitas, eventos, inscritos } para probar sin Supabase.
  if (process.env.NODE_ENV !== 'production' && process.env.PANEL_FIXTURE) {
    const f = JSON.parse(readFileSync(process.env.PANEL_FIXTURE, 'utf8')) as Record<'visitas' | 'eventos' | 'inscritos', Fila[]>;
    const en = (x: Fila) => s(x.created_at) >= desde && s(x.created_at) < hasta;
    return { visitas: f.visitas.filter(en), eventos: f.eventos.filter(en), inscritos: f.inscritos.filter(en) };
  }
  const rango = (q: any) => q.gte('created_at', desde).lt('created_at', hasta); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [visitas, eventos, inscritos] = await Promise.all([
    todas(
      'page_views',
      'created_at, anonymous_id, session_id, path, referrer, user_agent, country, utm_source, utm_medium, utm_campaign, utm_content, first_touch_utm_source',
      (q) => rango(q.or('path.like./vsl%,path.like./neurociencia%')),
    ),
    todas('resource_events', 'created_at, anonymous_id, session_id, event_type, resource_kind', (q) => rango(q.eq('resource_title', RECURSO_LANDING))),
    todas('leads', 'id, created_at, name, email, whatsapp, whatsapp_country_code, survey, anonymous_id, utm_source, utm_campaign, utm_content, first_touch_utm_source', (q) =>
      rango(q.eq('source', FUENTE_LISTA)),
    ),
  ]);
  return { visitas, eventos, inscritos };
}

export async function leerPanel({ desde, hasta, incluirEquipo }: Filtros) {
  // Periodo anterior para comparar: el mismo tramo corrido hacia atrás. Si el periodo sigue abierto
  // ("Hoy", "Últimos 7 días"), se corre en días enteros y se corta a la misma hora (hoy hasta las 10:00 vs. ayer hasta las 10:00).
  const DIA = 86_400_000;
  const ini = Date.parse(desde);
  const abierto = Date.parse(hasta) > Date.now();
  const fin = abierto ? Date.now() : Date.parse(hasta);
  const corrimiento = abierto ? Math.max(1, Math.ceil((fin - ini) / DIA)) * DIA : fin - ini;
  const antesDesde = new Date(ini - corrimiento).toISOString();
  const antesHasta = new Date(fin - corrimiento).toISOString();

  const [actual, anterior] = await Promise.all([leerRango(desde, hasta), leerRango(antesDesde, antesHasta)]);
  const datos = calcularPanel({ ...actual, incluirEquipo });
  const previo = calcularPanel({ ...anterior, incluirEquipo });
  return { ...datos, anterior: { desde: antesDesde, hasta: antesHasta, kpis: previo.kpis } };
}

/** Cálculo puro de las métricas (separado de la lectura para poder probarlo). */
export function calcularPanel({
  visitas,
  eventos,
  inscritos,
  incluirEquipo,
}: {
  visitas: Fila[];
  eventos: Fila[];
  inscritos: Fila[];
  incluirEquipo: boolean;
}) {
  // --- Limpieza: equipo y robots de revisión de Meta ---
  const prefijos = equipo();
  const paises = paisesAnuncios();
  const internos = new Set<string>();
  const robots = new Set<string>();
  for (const v of visitas) {
    const id = s(v.anonymous_id);
    if (prefijos.some((p) => id.startsWith(p)) || s(v.referrer).includes(DOMINIO_DEMO)) internos.add(id);
    if (esAnuncio(v) && !paises.includes(s(v.country).toUpperCase())) robots.add(id);
  }
  const vale = (id: unknown) => !robots.has(s(id)) && (incluirEquipo || !internos.has(s(id)));
  const V = visitas.filter((v) => vale(v.anonymous_id));
  const E = eventos.filter((e) => vale(e.anonymous_id));
  const L = inscritos.filter((l) => vale(l.anonymous_id));

  // --- Personas: cada una con su primera visita (canal) y su primer clic de anuncio (anuncio) ---
  const primera = new Map<string, Fila>();
  const primerAnuncio = new Map<string, Fila>();
  for (const v of V) {
    const id = s(v.anonymous_id);
    if (!primera.has(id)) primera.set(id, v);
    if (!primerAnuncio.has(id) && esAnuncio(v)) primerAnuncio.set(id, v);
  }
  const personas = [...primera.keys()];
  const n = personas.length;
  const canalDe = new Map(personas.map((id) => [id, canal(primera.get(id)!)]));
  const deAnuncio = (id: string) => primerAnuncio.has(id);

  // --- Qué hizo cada persona ---
  const hizo = (pred: (e: Fila) => boolean) => new Set(E.filter(pred).map((e) => s(e.anonymous_id)));
  const leyo = (p: number) => hizo((e) => /^scroll_\d+$/.test(s(e.event_type)) && Number(s(e.event_type).slice(7)) >= p);
  const mitad = leyo(50);
  const final = leyo(100);
  const sonido = hizo((e) => e.event_type === 'vsl_sonido' || e.event_type === 'video_play');
  const testimonios = hizo((e) => e.event_type === 'testimonio_ver');
  const registro = hizo((e) => ['lista_abrir', 'cta_click', 'checkout_click'].includes(s(e.event_type)));
  const inscritosIds = new Set([...hizo((e) => e.event_type === 'lista_espera'), ...L.map((l) => s(l.anonymous_id))]);
  // Si alguien se inscribió, también abrió el registro (por si el evento de apertura no llegó).
  for (const id of inscritosIds) registro.add(id);

  const tiempoDe = new Map<string, number>();
  for (const e of E) {
    if (e.event_type !== 'salida') continue;
    const t = parseInt(s(e.resource_kind), 10);
    if (t > 0 && t <= 1800) tiempoDe.set(s(e.anonymous_id), Math.max(tiempoDe.get(s(e.anonymous_id)) ?? 0, t));
  }

  // --- Embudo, separado en anuncios y orgánico ---
  const grupos = {
    todos: personas,
    anuncios: personas.filter(deAnuncio),
    organico: personas.filter((id) => !deAnuncio(id)),
  };
  const cuantos = (ids: string[], set: Set<string>) => ids.filter((id) => set.has(id)).length;
  const pasos: [string, Set<string> | null][] = [
    ['Entraron', null],
    ['Leyeron la mitad', mitad],
    ['Abrieron el registro', registro],
    ['Se inscribieron', inscritosIds],
  ];
  const embudo = pasos.map(([nombre, set]) => {
    const fila = (ids: string[]) => {
      const v = set ? cuantos(ids, set) : ids.length;
      return { n: v, pct: pct(v, ids.length) };
    };
    return { nombre, todos: fila(grupos.todos), anuncios: fila(grupos.anuncios), organico: fila(grupos.organico) };
  });
  // Fuera del embudo: no hace falta llegar al final para inscribirse (los botones están en toda la página).
  const interacciones = [
    { nombre: 'Llegaron al final', n: cuantos(personas, final) },
    { nombre: 'Activaron el video', n: cuantos(personas, sonido) },
    { nombre: 'Abrieron un testimonio', n: cuantos(personas, testimonios) },
  ].map((x) => ({ ...x, pct: pct(x.n, n) }));

  // --- Flujo diario (hora de Lima) ---
  const dias = new Map<string, { personas: Set<string>; anuncios: Set<string>; nuevas: number; inscritos: number }>();
  const dia = (d: string) => dias.get(d) ?? dias.set(d, { personas: new Set(), anuncios: new Set(), nuevas: 0, inscritos: 0 }).get(d)!;
  for (const v of V) {
    const d = dia(diaLima(s(v.created_at)));
    d.personas.add(s(v.anonymous_id));
    if (esAnuncio(v)) d.anuncios.add(s(v.anonymous_id));
  }
  for (const [, v] of primera) dia(diaLima(s(v.created_at))).nuevas++;
  for (const l of L) dia(diaLima(s(l.created_at))).inscritos++;
  const porDia = [...dias.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, d]) => ({
      fecha,
      personas: d.personas.size,
      anuncios: d.anuncios.size,
      organico: d.personas.size - d.anuncios.size,
      nuevas: d.nuevas,
      inscritos: d.inscritos,
      tasa: pct(d.inscritos, d.personas.size),
    }));

  // --- Anuncios: cada persona cuenta en el anuncio de su primer clic ---
  type Agrupado = { personas: number; mitad: number; final: number; registro: number; inscritos: number; tiempos: number[] };
  const agrupar = (clave: (v: Fila) => string) => {
    const m = new Map<string, Agrupado>();
    for (const [id, v] of primerAnuncio) {
      const k = clave(v) || '(sin nombre)';
      const f = m.get(k) ?? m.set(k, { personas: 0, mitad: 0, final: 0, registro: 0, inscritos: 0, tiempos: [] }).get(k)!;
      f.personas++;
      if (mitad.has(id)) f.mitad++;
      if (final.has(id)) f.final++;
      if (registro.has(id)) f.registro++;
      if (inscritosIds.has(id)) f.inscritos++;
      if (tiempoDe.has(id)) f.tiempos.push(tiempoDe.get(id)!);
    }
    return [...m.entries()]
      .map(([nombre, f]) => ({
        nombre,
        personas: f.personas,
        mitad: pct(f.mitad, f.personas),
        final: pct(f.final, f.personas),
        registro: f.registro,
        inscritos: f.inscritos,
        tasa: pct(f.inscritos, f.personas),
        tiempo: mediana(f.tiempos),
      }))
      .sort((a, b) => b.inscritos - a.inscritos || b.personas - a.personas);
  };
  const anuncios = {
    porAnuncio: agrupar((v) => limpiar(v.utm_content)),
    porUbicacion: agrupar((v) => ubicacion(limpiar(v.utm_source))),
    porConjunto: agrupar((v) => limpiar(v.utm_campaign)),
    porCampana: agrupar((v) => limpiar(v.utm_medium)),
  };

  // --- Canales ---
  const porCanal = new Map<string, { personas: number; final: number; registro: number; inscritos: number }>();
  for (const [id, c] of canalDe) {
    const f = porCanal.get(c) ?? porCanal.set(c, { personas: 0, final: 0, registro: 0, inscritos: 0 }).get(c)!;
    f.personas++;
    if (final.has(id)) f.final++;
    if (registro.has(id)) f.registro++;
    if (inscritosIds.has(id)) f.inscritos++;
  }
  const canales = [...porCanal.entries()]
    .map(([nombre, f]) => ({ nombre, ...f, finalPct: pct(f.final, f.personas), tasa: pct(f.inscritos, f.personas) }))
    .sort((a, b) => b.personas - a.personas);

  const prim = [...primera.values()];
  const desglose = {
    pais: contar(prim.map((v) => s(v.country) || '?')),
    dispositivo: contar(prim.map((v) => dispositivo(s(v.user_agent), s(v.path)))),
  };

  const listaInscritos = [...L].reverse().map((l) => {
    const survey = (l.survey ?? {}) as Record<string, unknown>;
    const id = s(l.anonymous_id);
    const ad = primerAnuncio.get(id);
    return {
      id: s(l.id),
      fecha: s(l.created_at),
      nombre: ocultarNombre(s(l.name)),
      correo: ocultarCorreo(s(l.email)),
      whatsapp: s(l.whatsapp) ? `${s(l.whatsapp_country_code)} ${ocultarTelefono(s(l.whatsapp))}`.trim() : '',
      pais: s(survey.pais),
      fuente: canalDe.get(id) ?? canal(l),
      anuncio: ad ? limpiar(ad.utm_content) : esAnuncio(l) ? limpiar(l.utm_content) : '',
      equipo: internos.has(id),
    };
  });

  const NOMBRES: Record<string, string> = {
    scroll_25: 'Bajó al 25%', scroll_50: 'Bajó a la mitad', scroll_75: 'Bajó al 75%', scroll_100: 'Llegó al final',
    video_play: 'Dio play al video', vsl_sonido: 'Activó el sonido del video', testimonio_ver: 'Abrió un testimonio',
    faq_abrir: 'Abrió una pregunta', cta_click: 'Clic en botón', checkout_click: 'Clic en reservar', lista_abrir: 'Abrió el registro',
    lista_espera: 'Se inscribió', salida: 'Salió',
  };
  const actividad = [
    ...V.slice(-40).map((v) => ({
      t: s(v.created_at),
      quien: s(v.anonymous_id).slice(0, 6),
      que: 'Entró a la página',
      detalle: [s(v.country), dispositivo(s(v.user_agent), s(v.path)), esAnuncio(v) ? `Anuncio: ${limpiar(v.utm_content)}` : canal(v)].join(' · '),
    })),
    ...E.slice(-60).map((e) => ({ t: s(e.created_at), quien: s(e.anonymous_id).slice(0, 6), que: NOMBRES[s(e.event_type)] ?? s(e.event_type), detalle: s(e.resource_kind) })),
  ]
    .sort((a, b) => b.t.localeCompare(a.t))
    .slice(0, 40);

  // En la página ahora: personas con alguna visita o movimiento en los últimos 5 minutos (las que ya salieron no cuentan).
  const hace5 = new Date(Date.now() - 5 * 60_000).toISOString();
  const ultimo = new Map<string, { t: string; salio: boolean }>();
  for (const x of [...V.map((v) => ({ id: s(v.anonymous_id), t: s(v.created_at), salio: false })), ...E.map((e) => ({ id: s(e.anonymous_id), t: s(e.created_at), salio: e.event_type === 'salida' }))]) {
    const u = ultimo.get(x.id);
    if (!u || x.t >= u.t) ultimo.set(x.id, { t: x.t, salio: x.salio });
  }
  const enLinea = [...ultimo.values()].filter((u) => u.t >= hace5 && !u.salio).length;

  const tiempos = [...tiempoDe.entries()].map(([, t]) => t);
  return {
    generado: new Date().toISOString(),
    kpis: {
      personas: n,
      deAnuncios: grupos.anuncios.length,
      inscritos: inscritosIds.size,
      conversion: pct(inscritosIds.size, n),
      conversionAnuncios: pct(cuantos(grupos.anuncios, inscritosIds), grupos.anuncios.length),
      leyeronFinal: pct(cuantos(personas, final), n),
      tiempoMediano: mediana(tiempos),
      enLinea,
    },
    calidad: {
      visitas: V.length,
      sesiones: new Set(V.map((v) => s(v.session_id))).size,
      volvieron: contar(V.map((v) => s(v.anonymous_id))).filter((x) => x.n > 1).length,
      robots: robots.size,
      equipo: incluirEquipo ? 0 : [...internos].filter((id) => !robots.has(id)).length,
      sinEtiqueta: prim.filter((v) => !s(v.utm_source) && !s(v.first_touch_utm_source)).length,
    },
    embudo,
    interacciones,
    porDia,
    anuncios,
    canales,
    desglose,
    inscritos: listaInscritos,
    actividad,
  };
}

export type DatosPanel = Awaited<ReturnType<typeof leerPanel>>;

/** Datos completos de un inscrito (solo al pedirlo explícitamente). */
export async function contactoCompleto(id: string) {
  const { data, error } = await db()
    .from('leads')
    .select('name, email, whatsapp, whatsapp_country_code')
    .eq('id', id)
    .eq('source', FUENTE_LISTA)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
