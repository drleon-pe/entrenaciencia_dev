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
  // Testimonios antes de las preguntas y sin el recuadro "Qué incluye" de arriba (publicado en producción 10:44).
  { id: 'v3', nombre: 'Cambio web 1 (testimonios y qué incluye)', desde: '2026-10-20T10:45:00-05:00' },
  // Cambio web 2 (publicado en producción 12:26): precio S/ 249 → S/ 149 en la caja de la oferta y en el formulario,
  // formulario con "Gratis" y dos puntos (sin costo y cupón), y "Nuestro contenido" (7 Reels) en lugar de los testimonios.
  { id: 'v4', nombre: 'Cambio web 2 (precio y nuestro contenido)', desde: '2026-10-21T12:26:00-05:00' },
];

/**
 * El panel solo cuenta el tráfico desde que la landing es lista de espera gratis: lo anterior era la reserva pagada
 * de US$5 y mezclarlo distorsiona la conversión (pedido del Dr. León). Ninguna consulta lee antes de esta fecha.
 */
export const INICIO_DATOS = new Date(VERSIONES.find((v) => v.id === 'v2')!.desde).toISOString();
export const VERSIONES_PANEL = VERSIONES.filter((v) => Date.parse(v.desde) >= Date.parse(INICIO_DATOS));

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
  if (!ua && !path) return 'Sin dato';
  if (path.includes('movil')) return 'Celular';
  if (path.includes('escritorio')) return 'Computadora';
  return /iphone|android.*mobile|mobile/i.test(ua) ? 'Celular' : 'Computadora';
}

/**
 * ¿De qué plataforma de anuncios vino la visita? ('' = no es anuncio)
 * - Meta: utm_source es la ubicación ({{placement}}: Instagram_Reels, Facebook_Mobile_Feed, Whatsapp_Status,
 *   Instagram_Stories, Others…) y utm_content el nombre del anuncio. WhatsApp Estados o Historias de Instagram son
 *   ubicaciones PAGADAS de Meta, no publicaciones orgánicas. El link de la bio ("ig" / link_in_bio) es orgánico.
 * - TikTok: utm_source=tiktok con campaña o utm_medium=paid (el link orgánico de la bio no lleva campaña).
 */
export function plataforma(v: Fila): '' | 'Meta' | 'TikTok' {
  const src = limpiar(v.utm_source);
  if (/^(facebook|instagram|messenger|whatsapp|audience|an|threads|others?)(_|$)/i.test(src) && Boolean(limpiar(v.utm_content))) return 'Meta';
  if (/^tiktok/i.test(src) && (/^(paid|cpc|ads?|pago)$/i.test(limpiar(v.utm_medium)) || Boolean(limpiar(v.utm_campaign)))) return 'TikTok';
  // Clic de anuncio que perdió sus etiquetas: Meta pega fbclid y TikTok ttclid a cada clic pagado. Así un medio pagado
  // nunca cae en "Otros" (que es solo lo orgánico). El link de la bio de Instagram lleva utm_source=ig y no entra aquí.
  if (!src) {
    const ref = s(v.referrer);
    if (/[?&]ttclid=/.test(ref)) return 'TikTok';
    if (/[?&]fbclid=/.test(ref)) return 'Meta';
  }
  return '';
}
export function esAnuncio(v: Fila): boolean {
  return plataforma(v) !== '';
}

const MACRO_SIN_REEMPLAZAR = /__[A-Z_]+__|\{\{[^}]*\}\}/;
/** Una campaña cuenta como activa si tuvo clics reales en estas últimas horas (una pausada deja de recibirlos al instante). */
export const HORAS_ACTIVA = 6;
const ROBOT_UA = /meta-externalads|facebookexternalhit|facebookcatalog|bytespider|tiktokspider|bot\b|crawler|spider|headless/i;

/** Nombre corto de cada sección de la landing (data-screen-label), en el orden en que aparecen. */
const SECCIONES: [string, string][] = [
  ['01', 'Inicio (video)'], ['02', 'Por qué funciona'], ['03', 'Qué incluye'], ['04', 'Quién está detrás'],
  ['04b', 'Testimonios'], ['05', 'Preguntas frecuentes'], ['06', 'Cierre (oferta)'],
];

/** Valor de una etiqueta de anuncio; las macros que la plataforma no reemplazó (__CAMPAIGN_NAME__, {{ad.name}}) quedan vacías. */
function etiqueta(v: unknown): string {
  const t = limpiar(v);
  return /^__[A-Z_]+__$|^\{\{.*\}\}$/.test(t) ? '' : t;
}

const UBICACIONES: Record<string, string> = {
  whatsapp_status: 'WhatsApp · Estados', instagram_stories: 'Instagram · Historias', instagram_reels: 'Instagram · Reels',
  instagram_feed: 'Instagram · Feed', instagram_explore: 'Instagram · Explorar', instagram_explore_grid_home: 'Instagram · Explorar',
  instagram_profile_feed: 'Instagram · Perfil', facebook_mobile_feed: 'Facebook · Feed', facebook_desktop_feed: 'Facebook · Feed (computadora)',
  facebook_mobile_reels: 'Facebook · Reels', facebook_stories: 'Facebook · Historias', facebook_right_column: 'Facebook · Columna derecha',
  facebook_marketplace: 'Facebook · Marketplace', facebook_instream_video: 'Facebook · Videos', facebook_search: 'Facebook · Búsqueda',
  threads_feed: 'Threads · Feed', messenger_inbox: 'Messenger · Bandeja', messenger_stories: 'Messenger · Historias',
  audience_network: 'Audience Network (apps de terceros)', an: 'Audience Network (apps de terceros)', others: 'Meta · Otras ubicaciones', other: 'Meta · Otras ubicaciones',
};

/** Nombre legible de dónde se mostró el anuncio. */
function ubicacion(v: Fila): string {
  if (plataforma(v) === 'TikTok') return 'TikTok';
  const src = limpiar(v.utm_source).toLowerCase();
  if (!src) return 'Meta · ubicación desconocida (link sin UTM)';
  if (UBICACIONES[src]) return UBICACIONES[src];
  const [red, ...resto] = src.split('_');
  return `${red.replace(/^\w/, (c) => c.toUpperCase())} · ${resto.join(' ').replace(/\bmobile\b/g, '').trim() || 'otra'}`;
}

/** Nombre del anuncio, conjunto y campaña según la plataforma (TikTok: utm_content = anuncio, utm_term = grupo). */
function nombreAnuncio(v: Fila): string {
  const n = etiqueta(v.utm_content);
  if (n) return n;
  if (!limpiar(v.utm_source) && plataforma(v)) return `${plataforma(v)} · clic sin etiquetas`;
  // Los links de TikTok necesitan utm_content=__CID_NAME__ para saber de qué anuncio vino cada persona.
  return plataforma(v) === 'TikTok' ? 'TikTok · sin nombre de anuncio (falta utm_content en el link)' : '';
}
function nombreConjunto(v: Fila): string {
  return plataforma(v) === 'TikTok' ? etiqueta(v.utm_term) || 'TikTok · sin nombre de grupo' : etiqueta(v.utm_campaign);
}
function nombreCampana(v: Fila): string {
  if (!limpiar(v.utm_source) && plataforma(v)) return `${plataforma(v)} · sin etiquetas (link sin UTM)`;
  return plataforma(v) === 'TikTok' ? etiqueta(v.utm_campaign) || 'TikTok · sin nombre de campaña' : etiqueta(v.utm_medium);
}

/**
 * Canal de llegada de una visita. Prioridad: anuncio de Meta → etiqueta UTM → app desde la que se abrió
 * (navegador interno de Instagram/TikTok/Facebook) → sitio de procedencia → link directo.
 */
export function canal(v: Fila): string {
  const plat = plataforma(v);
  if (plat) return `Anuncios ${plat}`;
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
  // Persona con actividad pero sin la visita registrada (el aviso de entrada no llegó): no se sabe por dónde vino.
  if (v.path === undefined) return 'Sin origen registrado';
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

/** Nombre legible de cada evento de la landing (feed en vivo y recorrido de cada inscrito). */
const NOMBRES: Record<string, string> = {
  scroll_25: 'Bajó al 25%', scroll_50: 'Bajó a la mitad', scroll_75: 'Bajó al 75%', scroll_100: 'Llegó al final',
  video_play: 'Dio play al video', vsl_sonido: 'Activó el sonido del video', testimonio_ver: 'Abrió un testimonio', contenido_play: 'Abrió un video de Nuestro contenido',
  faq_abrir: 'Abrió una pregunta', cta_click: 'Clic en botón', checkout_click: 'Clic en reservar', lista_abrir: 'Abrió el registro',
  lista_espera: 'Se inscribió', salida: 'Salió', seccion_ver: 'Vio la sección',
  video_25: 'Vio el 25% del video', video_50: 'Vio la mitad del video', video_75: 'Vio el 75% del video', video_100: 'Vio el video completo',
};

/** Pestañas del panel: todo, solo Instagram/Facebook (Meta: anuncios y orgánico) o solo TikTok (anuncios y orgánico). */
export type Fuente = 'todo' | 'meta' | 'tiktok';
const CANALES_FUENTE: Record<Exclude<Fuente, 'todo'>, string[]> = {
  meta: ['Anuncios Meta', 'Instagram orgánico', 'Facebook orgánico'],
  tiktok: ['Anuncios TikTok', 'TikTok'],
};

/** Grupos de tráfico por plataforma, en el orden en que se muestran. */
export const GRUPOS_TRAFICO = ['Anuncios Meta', 'Instagram y Facebook orgánico', 'Anuncios TikTok', 'TikTok orgánico', 'Otros'] as const;
export type GrupoTrafico = (typeof GRUPOS_TRAFICO)[number];
export function grupoTrafico(v: Fila): GrupoTrafico {
  const c = canal(v);
  if (c === 'Anuncios Meta') return 'Anuncios Meta';
  if (c === 'Instagram orgánico' || c === 'Facebook orgánico') return 'Instagram y Facebook orgánico';
  if (c === 'Anuncios TikTok') return 'Anuncios TikTok';
  if (c === 'TikTok') return 'TikTok orgánico';
  return 'Otros';
}

export type Filtros = { desde: string; hasta: string; incluirEquipo: boolean; fuente?: Fuente };

async function leerRango(desdePedido: string, hasta: string) {
  const desde = Date.parse(desdePedido) < Date.parse(INICIO_DATOS) ? INICIO_DATOS : desdePedido;
  if (Date.parse(hasta) <= Date.parse(desde)) return { visitas: [], eventos: [], inscritos: [], equipoHistorico: [] as string[] };
  // Solo en desarrollo: PANEL_FIXTURE apunta a un JSON con { visitas, eventos, inscritos } para probar sin Supabase.
  if (process.env.NODE_ENV !== 'production' && process.env.PANEL_FIXTURE) {
    const f = JSON.parse(readFileSync(process.env.PANEL_FIXTURE, 'utf8')) as Record<'visitas' | 'eventos' | 'inscritos', Fila[]>;
    const en = (x: Fila) => s(x.created_at) >= desde && s(x.created_at) < hasta;
    const equipoHistorico = [...new Set(f.visitas.filter((v) => s(v.referrer).includes(DOMINIO_DEMO)).map((v) => s(v.anonymous_id)))];
    return { visitas: f.visitas.filter(en), eventos: f.eventos.filter(en), inscritos: f.inscritos.filter(en), equipoHistorico };
  }
  const rango = (q: any) => q.gte('created_at', desde).lt('created_at', hasta); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [visitas, eventos, inscritos, equipoHistorico] = await Promise.all([
    todas(
      'page_views',
      'created_at, anonymous_id, session_id, path, referrer, user_agent, country, utm_source, utm_medium, utm_campaign, utm_content, utm_term, first_touch_utm_source',
      (q) => rango(q.or('path.like./vsl%,path.like./neurociencia%').not('path', 'like', '%pago%')),
    ),
    todas('resource_events', 'created_at, anonymous_id, session_id, event_type, resource_kind, utm_source, utm_medium, utm_campaign, utm_content, utm_term, first_touch_utm_source', (q) => rango(q.eq('resource_title', RECURSO_LANDING))),
    todas('leads', 'id, created_at, name, email, whatsapp, whatsapp_country_code, survey, anonymous_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, first_touch_utm_source', (q) =>
      rango(q.eq('source', FUENTE_LISTA)),
    ),
    // Quien alguna vez entró desde el link del demo es del equipo, aunque esa visita quede fuera del periodo elegido.
    todas('page_views', 'created_at, anonymous_id', (q) => q.like('referrer', `%${DOMINIO_DEMO}%`)),
  ]);
  return { visitas, eventos, inscritos, equipoHistorico: [...new Set(equipoHistorico.map((v) => s(v.anonymous_id)))] };
}

/** Último clic real de anuncio por campaña («Plataforma|Campaña» → hora), sin robots de revisión. */
function ultimosClicsPorCampana(visitas: Fila[]): Record<string, string> {
  const paises = paisesAnuncios();
  const r: Record<string, string> = {};
  for (const v of visitas) {
    if (!esAnuncio(v) || !paises.includes(s(v.country).toUpperCase()) || ROBOT_UA.test(s(v.user_agent))) continue;
    if (MACRO_SIN_REEMPLAZAR.test([v.utm_source, v.utm_medium, v.utm_campaign, v.utm_content, v.utm_term].map(s).join('|'))) continue;
    const k = `${plataforma(v)}|${nombreCampana(v) || '(sin nombre de campaña)'}`;
    if ((r[k] ?? '') < s(v.created_at)) r[k] = s(v.created_at);
  }
  return r;
}

export async function leerPanel({ desde, hasta, incluirEquipo, fuente = 'todo' }: Filtros) {
  // Periodo anterior para comparar: el mismo tramo corrido hacia atrás. Si el periodo sigue abierto
  // ("Hoy", "Últimos 7 días"), se corre en días enteros y se corta a la misma hora (hoy hasta las 10:00 vs. ayer hasta las 10:00).
  const DIA = 86_400_000;
  const ini = Date.parse(desde);
  const abierto = Date.parse(hasta) > Date.now();
  const fin = abierto ? Date.now() : Date.parse(hasta);
  const corrimiento = abierto ? Math.max(1, Math.ceil((fin - ini) / DIA)) * DIA : fin - ini;
  const antesDesde = new Date(ini - corrimiento).toISOString();
  const antesHasta = new Date(fin - corrimiento).toISOString();

  // Últimas horas, sea cual sea el periodo elegido: dice qué campañas están activas ahora.
  const hace24 = new Date(Date.now() - HORAS_ACTIVA * 3600_000).toISOString();
  const [actual, anterior, reciente] = await Promise.all([
    leerRango(desde, hasta),
    leerRango(antesDesde, antesHasta),
    leerRango(hace24, new Date(Date.now() + 60_000).toISOString()),
  ]);
  const datos = calcularPanel({ ...actual, incluirEquipo, fuente, ultimosClics: ultimosClicsPorCampana(reciente.visitas) });
  const previo = calcularPanel({ ...anterior, incluirEquipo, fuente });
  // Si el periodo anterior empieza antes de la lista de espera (11 oct), está incompleto: compararlo daría "▲ 5000%".
  const completo = Date.parse(antesDesde) >= Date.parse(INICIO_DATOS);
  return { ...datos, anterior: { desde: antesDesde, hasta: antesHasta, completo, kpis: completo ? previo.kpis : null } };
}

/** Cálculo puro de las métricas (separado de la lectura para poder probarlo). */
export function calcularPanel({
  visitas,
  eventos,
  inscritos,
  incluirEquipo,
  fuente = 'todo',
  equipoHistorico = [],
  ultimosClics,
}: {
  visitas: Fila[];
  eventos: Fila[];
  inscritos: Fila[];
  incluirEquipo: boolean;
  fuente?: Fuente;
  equipoHistorico?: string[];
  /** Último clic real por campaña en las últimas horas (para marcarla activa aunque el periodo elegido sea otro). */
  ultimosClics?: Record<string, string>;
}) {
  // --- Limpieza: equipo y robots de revisión de Meta y TikTok ---
  const prefijos = equipo();
  const paises = paisesAnuncios();
  const internos = new Set<string>(equipoHistorico);
  const robots = new Set<string>();
  for (const v of visitas) {
    const id = s(v.anonymous_id);
    if (prefijos.some((p) => id.startsWith(p)) || s(v.referrer).includes(DOMINIO_DEMO)) internos.add(id);
    if (esAnuncio(v) && !paises.includes(s(v.country).toUpperCase())) robots.add(id);
    // El revisor de anuncios abre el link sin reemplazar sus macros (__CID_NAME__, {{ad.name}}), aunque entre desde Perú.
    if (MACRO_SIN_REEMPLAZAR.test([v.utm_source, v.utm_medium, v.utm_campaign, v.utm_content, v.utm_term].map(s).join('|'))) robots.add(id);
    // Rastreadores (meta-externalads, facebookexternalhit, bots) y revisores que abren el link sin etiquetas desde fuera
    // de los países de los anuncios (EE. UU., Brasil, Alemania…): llegan como "Web entrenaciencia.com" o "Link directo".
    if (ROBOT_UA.test(s(v.user_agent))) robots.add(id);
    else if (!s(v.utm_source) && !paises.includes(s(v.country).toUpperCase()) && /entrenaciencia\.com\/neurociencia(\?fbclid=|$|\?)/.test(s(v.referrer))) robots.add(id);
  }
  // Nunca se descarta a quien se inscribió.
  for (const x of [...inscritos, ...eventos.filter((e) => e.event_type === 'lista_espera')]) robots.delete(s(x.anonymous_id));
  const limpio = (id: unknown) => !robots.has(s(id)) && (incluirEquipo || !internos.has(s(id)));
  // Pestaña: cada persona pertenece a la plataforma por la que llegó la primera vez.
  let deFuente: Set<string> | null = null;
  if (fuente !== 'todo') {
    const vistos = new Set<string>();
    deFuente = new Set();
    for (const v of visitas) {
      const id = s(v.anonymous_id);
      if (!limpio(id) || vistos.has(id)) continue;
      vistos.add(id);
      if (CANALES_FUENTE[fuente].includes(canal(v))) deFuente.add(id);
    }
    // Quien no tiene la visita registrada pertenece a la plataforma de las etiquetas de su inscripción o sus eventos.
    for (const x of [...inscritos, ...eventos]) {
      const id = s(x.anonymous_id);
      if (!id || !limpio(id) || vistos.has(id)) continue;
      vistos.add(id);
      if (CANALES_FUENTE[fuente].includes(canal(x))) deFuente.add(id);
    }
  }
  const vale = (id: unknown) => limpio(id) && (!deFuente || deFuente.has(s(id)));
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
  // Personas sin visita registrada (el aviso de entrada no llegó, p. ej. en el navegador interno de TikTok) pero con
  // actividad: inscripción o cualquier evento (bajar, salir…). Igual entraron, así que cuentan; primero se usa la
  // inscripción (trae etiquetas UTM) y si no, su primer evento. Sin origen conocido, caen en "Otros".
  {
    for (const x of [...L, ...E.filter((e) => e.event_type === 'lista_espera'), ...E]) {
      const id = s(x.anonymous_id);
      if (id && !primera.has(id)) primera.set(id, x);
      // Sus eventos traen las etiquetas del anuncio: así cuentan en su plataforma y anuncio, no en "Otros".
      if (id && !primerAnuncio.has(id) && esAnuncio(x)) primerAnuncio.set(id, x);
    }
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
  // Desde el cambio web 2 los testimonios son videos de «Nuestro contenido»: abrir uno cuenta igual.
  const testimonios = hizo((e) => e.event_type === 'testimonio_ver' || e.event_type === 'contenido_play');
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
    { nombre: 'Abrieron un testimonio o video', n: cuantos(personas, testimonios) },
  ].map((x) => ({ ...x, pct: pct(x.n, n) }));

  // --- Flujo diario (hora de Lima) ---
  const dias = new Map<string, { personas: Set<string>; anuncios: Set<string>; grupo: Map<string, GrupoTrafico>; nuevas: number; inscritos: number }>();
  const dia = (d: string) => dias.get(d) ?? dias.set(d, { personas: new Set(), anuncios: new Set(), grupo: new Map(), nuevas: 0, inscritos: 0 }).get(d)!;
  for (const v of V) {
    const d = dia(diaLima(s(v.created_at)));
    const id = s(v.anonymous_id);
    d.personas.add(id);
    if (esAnuncio(v)) d.anuncios.add(id);
    // Plataforma del día: la de su primera visita de ese día.
    if (!d.grupo.has(id)) d.grupo.set(id, grupoTrafico(v));
  }
  // Quien no tiene visita registrada cuenta el día de su primera actividad, para que los días sumen lo mismo que el total.
  for (const [id, v] of primera) {
    if (v.path !== undefined) continue;
    const d = dia(diaLima(s(v.created_at)));
    d.personas.add(id);
    if (!d.grupo.has(id)) d.grupo.set(id, grupoTrafico(v));
  }
  for (const [, v] of primera) dia(diaLima(s(v.created_at))).nuevas++;
  // Inscritos por día: cada persona una sola vez, el día de su primera inscripción (hay quien se inscribe dos veces).
  const primeraInscripcion = new Map<string, string>();
  for (const x of [...L, ...E.filter((e) => e.event_type === 'lista_espera')]) {
    const id = s(x.anonymous_id) || `lead:${s(x.id)}`;
    const t = s(x.created_at);
    if (!primeraInscripcion.has(id) || t < primeraInscripcion.get(id)!) primeraInscripcion.set(id, t);
  }
  for (const [, t] of primeraInscripcion) dia(diaLima(t)).inscritos++;
  const porDia = [...dias.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, d]) => ({
      fecha,
      personas: d.personas.size,
      anuncios: d.anuncios.size,
      organico: d.personas.size - d.anuncios.size,
      nuevas: d.nuevas,
      plataformas: Object.fromEntries(GRUPOS_TRAFICO.map((g) => [g, [...d.grupo.values()].filter((x) => x === g).length])) as Record<GrupoTrafico, number>,
      inscritos: d.inscritos,
      tasa: pct(d.inscritos, d.personas.size),
    }));

  // --- Anuncios: cada persona cuenta en el anuncio de su primer clic ---
  // También aparecen los anuncios publicados que en el periodo solo recibieron la visita de revisión de la plataforma
  // (0 personas reales): así se ve que existen y que la plataforma casi no los está mostrando.
  type Agrupado = { plataforma: string; nombre: string; personas: number; mitad: number; final: number; registro: number; inscritos: number; tiempos: number[] };
  const agrupar = (clave: (v: Fila) => string) => {
    const m = new Map<string, Agrupado>();
    const fila = (v: Fila) => {
      const plat = plataforma(v);
      const nombre = clave(v) || '(sin nombre)';
      const k = `${plat}|${nombre}`;
      return m.get(k) ?? m.set(k, { plataforma: plat, nombre, personas: 0, mitad: 0, final: 0, registro: 0, inscritos: 0, tiempos: [] }).get(k)!;
    };
    const platPestana = fuente === 'meta' ? 'Meta' : fuente === 'tiktok' ? 'TikTok' : '';
    for (const v of visitas) if (esAnuncio(v) && (!platPestana || plataforma(v) === platPestana)) fila(v);
    for (const [id, v] of primerAnuncio) {
      const f = fila(v);
      f.personas++;
      if (mitad.has(id)) f.mitad++;
      if (final.has(id)) f.final++;
      if (registro.has(id)) f.registro++;
      if (inscritosIds.has(id)) f.inscritos++;
      if (tiempoDe.has(id)) f.tiempos.push(tiempoDe.get(id)!);
    }
    return [...m.values()]
      .map((f) => ({
        plataforma: f.plataforma,
        nombre: f.nombre,
        personas: f.personas,
        mitad: pct(f.mitad, f.personas),
        final: pct(f.final, f.personas),
        registro: f.registro,
        inscritos: f.inscritos,
        tasa: pct(f.inscritos, f.personas),
        tiempo: mediana(f.tiempos),
      }))
      .sort((a, b) => b.inscritos - a.inscritos || b.personas - a.personas || a.nombre.localeCompare(b.nombre));
  };
  const anuncios = {
    porAnuncio: agrupar(nombreAnuncio),
    porUbicacion: agrupar(ubicacion),
    porConjunto: agrupar(nombreConjunto),
    porCampana: agrupar(nombreCampana),
  };
  // --- Campañas: nivel universal (todas), por campaña y, dentro de cada una, sus anuncios ---
  // Cada persona cuenta en la campaña y el anuncio de su primer clic. Meta: campaña = utm_medium; TikTok: utm_campaign.
  const resumen = (ids: string[]) => {
    const n = ids.length;
    const t = ids.filter((id) => tiempoDe.has(id)).map((id) => tiempoDe.get(id)!);
    const ins = cuantos(ids, inscritosIds);
    return { personas: n, mitad: pct(cuantos(ids, mitad), n), final: pct(cuantos(ids, final), n), registro: cuantos(ids, registro), inscritos: ins, tasa: pct(ins, n), tiempo: mediana(t) };
  };
  const campanas = (() => {
    const platPestana = fuente === 'meta' ? 'Meta' : fuente === 'tiktok' ? 'TikTok' : '';
    type Grupo = { plataforma: string; nombre: string; ids: string[]; anuncios: Map<string, string[]> };
    const m = new Map<string, Grupo>();
    const grupo = (v: Fila) => {
      const plat = plataforma(v);
      const nombre = nombreCampana(v) || '(sin nombre de campaña)';
      const k = `${plat}|${nombre}`;
      return m.get(k) ?? m.set(k, { plataforma: plat, nombre, ids: [], anuncios: new Map() }).get(k)!;
    };
    // Anuncios publicados que solo vio la revisión de la plataforma: aparecen en su campaña con 0 personas.
    for (const v of visitas) {
      if (!esAnuncio(v) || (platPestana && plataforma(v) !== platPestana)) continue;
      const g = grupo(v);
      const a = nombreAnuncio(v) || '(sin nombre)';
      if (!g.anuncios.has(a)) g.anuncios.set(a, []);
    }
    for (const [id, v] of primerAnuncio) {
      if (platPestana && plataforma(v) !== platPestana) continue;
      const g = grupo(v);
      g.ids.push(id);
      const a = nombreAnuncio(v) || '(sin nombre)';
      (g.anuncios.get(a) ?? g.anuncios.set(a, []).get(a)!).push(id);
    }
    // Activa = tuvo clics reales en las últimas HORAS_ACTIVA horas (sin las APIs no se sabe si está pausada; esto la delata).
    const ultimaClic = new Map<string, string>(Object.entries(ultimosClics ?? {}));
    if (!ultimosClics) for (const v of V) {
      if (!esAnuncio(v) || robots.has(s(v.anonymous_id))) continue;
      const k = `${plataforma(v)}|${nombreCampana(v) || '(sin nombre de campaña)'}`;
      if ((ultimaClic.get(k) ?? '') < s(v.created_at)) ultimaClic.set(k, s(v.created_at));
    }
    const hace24 = new Date(Date.now() - HORAS_ACTIVA * 3600_000).toISOString();
    const lista = [...m.values()]
      .map((g) => ({
        plataforma: g.plataforma,
        nombre: g.nombre,
        ultimoClic: ultimaClic.get(`${g.plataforma}|${g.nombre}`) ?? null,
        activa: (ultimaClic.get(`${g.plataforma}|${g.nombre}`) ?? '') >= hace24,
        ...resumen(g.ids),
        anuncios: [...g.anuncios.entries()]
          .map(([nombre, ids]) => ({ plataforma: g.plataforma, nombre, ...resumen(ids) }))
          .sort((a, b) => b.inscritos - a.inscritos || b.personas - a.personas || a.nombre.localeCompare(b.nombre)),
      }))
      .sort((a, b) => Number(b.activa) - Number(a.activa) || b.inscritos - a.inscritos || b.personas - a.personas || a.nombre.localeCompare(b.nombre));
    const universal = (['Meta', 'TikTok'] as const).map((p) => {
      const de = lista.filter((c) => c.plataforma === p);
      return { plataforma: p, campanas: de.length, anuncios: de.reduce((x, c) => x + c.anuncios.length, 0), ...resumen(de.flatMap((c) => m.get(`${p}|${c.nombre}`)!.ids)) };
    });
    return { universal, lista };
  })();

  // Lo que no vino de un anuncio, por canal, con las mismas columnas que los anuncios.
  const otros = (() => {
    const m = new Map<string, Agrupado>();
    for (const id of grupos.organico) {
      const nombre = canalDe.get(id)!;
      const f = m.get(nombre) ?? m.set(nombre, { plataforma: 'Otros', nombre, personas: 0, mitad: 0, final: 0, registro: 0, inscritos: 0, tiempos: [] }).get(nombre)!;
      f.personas++;
      if (mitad.has(id)) f.mitad++;
      if (final.has(id)) f.final++;
      if (registro.has(id)) f.registro++;
      if (inscritosIds.has(id)) f.inscritos++;
      if (tiempoDe.has(id)) f.tiempos.push(tiempoDe.get(id)!);
    }
    return [...m.values()]
      .map((f) => ({ plataforma: f.plataforma, nombre: f.nombre, personas: f.personas, mitad: pct(f.mitad, f.personas), final: pct(f.final, f.personas), registro: f.registro, inscritos: f.inscritos, tasa: pct(f.inscritos, f.personas), tiempo: mediana(f.tiempos) }))
      .sort((a, b) => b.personas - a.personas);
  })();

  // --- Navegación: hasta dónde baja cada persona, qué toca y desde qué sección abre el registro ---
  const conBoton = new Map<string, Set<string>>();
  for (const e of E) {
    if (e.event_type !== 'cta_click' && e.event_type !== 'checkout_click') continue;
    const seccion = s(e.resource_kind).split(' · ')[0] || 'otro';
    const nombre = seccion === 'otro' ? 'Barra fija / otro botón' : seccion.replace(/^\d+\w?\s+/, '');
    (conBoton.get(nombre) ?? conBoton.set(nombre, new Set()).get(nombre)!).add(s(e.anonymous_id));
  }
  const cuenta = (nombre: string, set: Set<string>) => ({ nombre, n: cuantos(personas, set), pct: pct(cuantos(personas, set), n) });
  // Secciones vistas (evento seccion_ver, se mide desde el 20 oct): de las personas con al menos una, cuántas vieron cada sección.
  const vioSeccion = new Map<string, Set<string>>();
  for (const e of E) {
    if (e.event_type !== 'seccion_ver') continue;
    const cod = s(e.resource_kind).split(' ')[0];
    (vioSeccion.get(cod) ?? vioSeccion.set(cod, new Set()).get(cod)!).add(s(e.anonymous_id));
  }
  const conSecciones = new Set([...vioSeccion.values()].flatMap((x) => [...x]));
  const baseSecciones = personas.filter((id) => conSecciones.has(id));
  const navegacion = {
    secciones: SECCIONES.map(([cod, nombre]) => {
      const n = cuantos(baseSecciones, vioSeccion.get(cod) ?? new Set());
      return { nombre, n, pct: pct(n, baseSecciones.length) };
    }),
    personasConSecciones: baseSecciones.length,
    profundidad: [cuenta('Bajó al 25%', leyo(25)), cuenta('Bajó a la mitad', mitad), cuenta('Bajó al 75%', leyo(75)), cuenta('Llegó al final', final)],
    acciones: [
      cuenta('Activó el video', sonido),
      cuenta('Abrió un testimonio o video', testimonios),
      cuenta('Abrió una pregunta', hizo((e) => e.event_type === 'faq_abrir')),
      cuenta('Abrió el registro', registro),
      cuenta('Se inscribió', inscritosIds),
      cuenta('Vio la mitad del video (con sonido)', hizo((e) => e.event_type === 'video_50')),
      cuenta('Se fue en menos de 5 s', new Set([...tiempoDe.entries()].filter(([id, t]) => t < 5 && !leyo(25).has(id)).map(([id]) => id))),
    ],
    botones: [...conBoton.entries()].map(([nombre, set]) => cuenta(nombre, set)).sort((a, b) => b.n - a.n),
    tiempoMediano: mediana([...tiempoDe.values()]),
  };

  // --- Comportamiento por plataforma: las mismas métricas para todos y para cada grupo de tráfico ---
  // Rebote = se fue en menos de 5 s sin llegar al 25 %. Solo cuenta a quien tiene el tiempo medido (aviso de salida).
  const rebote = new Set([...tiempoDe.entries()].filter(([id, t]) => t < 5 && !leyo(25).has(id)).map(([id]) => id));
  const videoPct = (m: number) => hizo((e) => e.event_type === `video_${m}`);
  const grupoDe = new Map(personas.map((id) => [id, grupoTrafico(primera.get(id)!)]));
  const columnas: { nombre: string; ids: string[] }[] = [
    { nombre: 'Todos', ids: personas },
    ...GRUPOS_TRAFICO.map((g) => ({ nombre: g as string, ids: personas.filter((id) => grupoDe.get(id) === g) })),
  ];
  type Celda = { n: number; base: number } | { valor: number | null };
  const fila = (nombre: string, grupo: string, set: Set<string>, base?: (ids: string[]) => string[]) => ({
    nombre, grupo,
    valores: columnas.map((c) => {
      const b = base ? base(c.ids) : c.ids;
      return { n: cuantos(b, set), base: b.length } as Celda;
    }),
  });
  const conTiempo = (ids: string[]) => ids.filter((id) => tiempoDe.has(id));
  const conSec = (ids: string[]) => ids.filter((id) => conSecciones.has(id));
  const comportamiento = {
    columnas: columnas.map((c) => ({ nombre: c.nombre, personas: c.ids.length })),
    filas: [
      fila('Se fueron en menos de 5 s', '¿Se quedan o se van?', rebote, conTiempo),
      { nombre: 'Tiempo típico en la página', grupo: '¿Se quedan o se van?', valores: columnas.map((c) => ({ valor: mediana(c.ids.filter((id) => tiempoDe.has(id)).map((id) => tiempoDe.get(id)!)) }) as Celda) },
      fila('Bajó al 25%', '¿Hasta dónde bajan?', leyo(25)),
      fila('Bajó a la mitad', '¿Hasta dónde bajan?', mitad),
      fila('Bajó al 75%', '¿Hasta dónde bajan?', leyo(75)),
      fila('Llegó al final', '¿Hasta dónde bajan?', final),
      ...SECCIONES.map(([cod, nombre]) => fila(nombre, '¿Qué partes de la página ven?', vioSeccion.get(cod) ?? new Set(), conSec)),
      fila('Activó el sonido del video', '¿Qué hacen?', sonido),
      fila('Vio la mitad del video', '¿Qué hacen?', videoPct(50)),
      fila('Vio el video completo', '¿Qué hacen?', videoPct(100)),
      fila('Abrió un testimonio o video', '¿Qué hacen?', testimonios),
      fila('Abrió una pregunta', '¿Qué hacen?', hizo((e) => e.event_type === 'faq_abrir')),
      fila('Abrió el registro', '¿Qué hacen?', registro),
      fila('Se inscribió', '¿Qué hacen?', inscritosIds),
    ],
  };

  const porPlataforma = (['Meta', 'TikTok'] as const).map((p) => {
    const ids = [...primerAnuncio.entries()].filter(([, v]) => plataforma(v) === p).map(([id]) => id);
    return { nombre: p, personas: ids.length, inscritos: cuantos(ids, inscritosIds), tasa: pct(cuantos(ids, inscritosIds), ids.length), anuncios: new Set(visitas.filter((v) => plataforma(v) === p).map(nombreAnuncio)).size };
  });

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

  const trafico = GRUPOS_TRAFICO.map((g) => {
    const ids = personas.filter((id) => grupoTrafico(primera.get(id)!) === g);
    const ins = cuantos(ids, inscritosIds);
    return { nombre: g, personas: ids.length, pctPersonas: pct(ids.length, n), mitad: pct(cuantos(ids, mitad), ids.length), inscritos: ins, tasa: pct(ins, ids.length) };
  });

  const prim = [...primera.values()];
  const desglose = {
    pais: contar(prim.map((v) => s(v.country) || '?')),
    dispositivo: contar(prim.map((v) => dispositivo(s(v.user_agent), s(v.path)))),
  };

  // Hay quien se inscribe dos veces: la lista muestra cada registro, pero se marca cuántas veces lo hizo esa persona.
  const vecesPorPersona = contar(L.map((l) => s(l.anonymous_id) || `lead:${s(l.id)}`));
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
      anuncio: ad ? `${plataforma(ad)} · ${nombreAnuncio(ad)}` : esAnuncio(l) ? `${plataforma(l)} · ${nombreAnuncio(l)}` : '',
      equipo: internos.has(id),
      veces: vecesPorPersona.find((x) => x.nombre === (id || `lead:${s(l.id)}`))?.n ?? 1,
    };
  });

  const actividad = [
    ...V.slice(-40).map((v) => ({
      t: s(v.created_at),
      quien: s(v.anonymous_id).slice(0, 6),
      que: 'Entró a la página',
      detalle: [s(v.country), dispositivo(s(v.user_agent), s(v.path)), esAnuncio(v) ? `Anuncio ${plataforma(v)}: ${nombreAnuncio(v)}` : canal(v)].join(' · '),
    })),
    // Las secciones vistas no van al feed: serían 7 por persona y taparían lo demás.
    ...E.filter((e) => e.event_type !== 'seccion_ver').slice(-60).map((e) => ({ t: s(e.created_at), quien: s(e.anonymous_id).slice(0, 6), que: NOMBRES[s(e.event_type)] ?? s(e.event_type), detalle: s(e.resource_kind) })),
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
      equipo: incluirEquipo ? 0 : new Set(visitas.map((v) => s(v.anonymous_id)).filter((id) => internos.has(id) && !robots.has(id))).size,
      sinEtiqueta: prim.filter((v) => !s(v.utm_source) && !s(v.first_touch_utm_source)).length,
    },
    embudo,
    interacciones,
    porDia,
    anuncios: { ...anuncios, otros },
    navegacion,
    comportamiento,
    porPlataforma,
    campanas,
    trafico,
    canales,
    desglose,
    inscritos: listaInscritos,
    actividad,
  };
}

export type DatosPanel = Awaited<ReturnType<typeof leerPanel>>;

/**
 * Pestaña "Desde el cambio": cómo navega la gente en la versión actual frente a la anterior completa.
 * Sin APIs de anuncios (solo lo que se mide en la página).
 */
export async function leerCambio({ incluirEquipo, fuente = 'todo', version }: { incluirEquipo: boolean; fuente?: Fuente; version?: string }) {
  // Cada cambio se compara con la versión anterior; el "después" termina cuando empieza la versión siguiente.
  let i = VERSIONES_PANEL.findIndex((v) => v.id === version);
  if (i < 0) i = VERSIONES_PANEL.length - 1;
  const actual = VERSIONES_PANEL[i];
  const previa = VERSIONES_PANEL[i - 1] ?? actual;
  const siguiente = VERSIONES_PANEL[i + 1];
  const cambio = new Date(actual.desde).toISOString();
  const fin = siguiente && Date.parse(siguiente.desde) < Date.now() ? new Date(siguiente.desde).toISOString() : new Date().toISOString();
  const tramo = async (desde: string, hasta: string) => {
    const d = calcularPanel({ ...(await leerRango(desde, hasta)), incluirEquipo, fuente });
    return { desde, hasta, kpis: d.kpis, navegacion: d.navegacion, embudo: d.embudo };
  };
  const [antes, despues] = await Promise.all([tramo(new Date(previa.desde).toISOString(), cambio), tramo(cambio, fin)]);
  return { generado: new Date().toISOString(), version: actual, previa, antes, despues };
}
export type DatosCambio = Awaited<ReturnType<typeof leerCambio>>;

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

/**
 * Recorrido de un inscrito: todas sus visitas y eventos desde el inicio de la lista de espera (no solo el periodo elegido),
 * hasta dónde bajó, qué tocó y cuánto tardó desde la primera visita hasta inscribirse.
 */
export async function recorridoInscrito(id: string) {
  let lead: Fila | null;
  let visitas: Fila[];
  let eventos: Fila[];
  if (process.env.NODE_ENV !== 'production' && process.env.PANEL_FIXTURE) {
    const f = JSON.parse(readFileSync(process.env.PANEL_FIXTURE, 'utf8')) as Record<'visitas' | 'eventos' | 'inscritos', Fila[]>;
    lead = f.inscritos.find((l) => s(l.id) === id) ?? null;
    const aid = s(lead?.anonymous_id);
    visitas = f.visitas.filter((v) => aid && s(v.anonymous_id) === aid);
    eventos = f.eventos.filter((e) => aid && s(e.anonymous_id) === aid);
  } else {
    const { data, error } = await db().from('leads').select('id, created_at, anonymous_id').eq('id', id).eq('source', FUENTE_LISTA).maybeSingle();
    if (error) throw new Error(error.message);
    lead = data as Fila | null;
    const aid = s(lead?.anonymous_id);
    const desde = (q: any) => q.eq('anonymous_id', aid).gte('created_at', INICIO_DATOS); // eslint-disable-line @typescript-eslint/no-explicit-any
    [visitas, eventos] = aid
      ? await Promise.all([
          todas('page_views', 'created_at, session_id, path, referrer, user_agent, country, utm_source, utm_medium, utm_campaign, utm_content, utm_term, first_touch_utm_source', (q) =>
            desde(q.or('path.like./vsl%,path.like./neurociencia%').not('path', 'like', '%pago%')),
          ),
          todas('resource_events', 'created_at, session_id, event_type, resource_kind', (q) => desde(q.eq('resource_title', RECURSO_LANDING))),
        ])
      : [[], []];
  }
  if (!lead) return null;
  const inscripcion = s(lead.created_at);
  const pasos = [
    ...visitas.map((v) => ({
      t: s(v.created_at),
      que: 'Entró a la página',
      detalle: [s(v.country), dispositivo(s(v.user_agent), s(v.path)), esAnuncio(v) ? `Anuncio ${plataforma(v)}: ${nombreAnuncio(v) || '(sin nombre)'}` : canal(v)].join(' · '),
      tipo: 'visita',
    })),
    ...eventos.map((e) => {
      const tipo = s(e.event_type);
      let detalle = s(e.resource_kind);
      if (tipo === 'seccion_ver') detalle = SECCIONES.find(([c]) => c === detalle.split(' ')[0])?.[1] ?? detalle;
      return { t: s(e.created_at), que: NOMBRES[tipo] ?? tipo, detalle, tipo };
    }),
  ].sort((a, b) => a.t.localeCompare(b.t));
  const primera = pasos[0]?.t ?? inscripcion;
  // El aviso "se inscribió" llega milisegundos después del registro: 1 minuto de margen.
  const corte = new Date(Date.parse(inscripcion) + 60_000).toISOString();
  // Visitas = sesiones con actividad antes de inscribirse (algunas visitas no registraron la entrada pero sí sus eventos).
  const sesionesAntes = new Set([...visitas, ...eventos].filter((x) => s(x.created_at) <= corte).map((x) => s(x.session_id)).filter(Boolean));
  const maxScroll = Math.max(0, ...eventos.map((e) => (/^scroll_\d+$/.test(s(e.event_type)) ? Number(s(e.event_type).slice(7)) : 0)));
  const vistas = new Set(eventos.filter((e) => e.event_type === 'seccion_ver').map((e) => s(e.resource_kind).split(' ')[0]));
  return {
    inscripcion,
    primeraVisita: primera,
    minutosHastaInscribirse: Math.max(0, Math.round((Date.parse(inscripcion) - Date.parse(primera)) / 60000)),
    visitasAntes: sesionesAntes.size,
    sesiones: new Set(visitas.map((v) => s(v.session_id))).size,
    llegoPrimeraVez: visitas[0] ? (esAnuncio(visitas[0]) ? `Anuncio ${plataforma(visitas[0])}: ${nombreAnuncio(visitas[0]) || '(sin nombre)'}` : canal(visitas[0])) : 'Sin visita registrada',
    hastaDondeBajo: maxScroll,
    secciones: SECCIONES.map(([c, nombre]) => ({ nombre, vio: vistas.has(c) })),
    seccionesMedidas: vistas.size > 0,
    // Máximo 120 pasos para que la vista no se haga eterna.
    pasos: pasos.slice(0, 120).map(({ t, que, detalle, tipo }) => ({ t, que, detalle, despues: tipo !== 'lista_espera' && t > corte })),
  };
}
export type RecorridoInscrito = NonNullable<Awaited<ReturnType<typeof recorridoInscrito>>>;
