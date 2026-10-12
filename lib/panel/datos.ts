import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

function equipo(): string[] {
  const extra = (process.env.PANEL_EQUIPO ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return [...EQUIPO_POR_DEFECTO, ...extra];
}

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

function dispositivo(ua: string, path: string): string {
  if (path.includes('movil')) return 'Celular';
  if (path.includes('escritorio')) return 'Computadora';
  return /iphone|android.*mobile|mobile/i.test(ua) ? 'Celular' : 'Computadora';
}
function app(ua: string): string {
  if (/instagram/i.test(ua)) return 'Instagram (app)';
  if (/FBAN|FBAV/i.test(ua)) return 'Facebook (app)';
  if (/tiktok|musical_ly|bytedance/i.test(ua)) return 'TikTok (app)';
  if (/whatsapp/i.test(ua)) return 'WhatsApp';
  return 'Navegador';
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

export async function leerPanel({ desde, hasta, incluirEquipo }: Filtros) {
  const rango = (q: any) => q.gte('created_at', desde).lt('created_at', hasta); // eslint-disable-line @typescript-eslint/no-explicit-any

  const [visitas, eventos, inscritos] = await Promise.all([
    todas('page_views', 'created_at, anonymous_id, session_id, path, referrer, user_agent, country, utm_source, utm_campaign', (q) =>
      rango(q.like('path', '/vsl%')),
    ),
    todas('resource_events', 'created_at, anonymous_id, session_id, event_type, resource_kind', (q) =>
      rango(q.eq('resource_title', RECURSO_LANDING)),
    ),
    todas('leads', 'id, created_at, name, email, whatsapp, whatsapp_country_code, survey, anonymous_id, utm_source, utm_campaign, first_touch_utm_source', (q) =>
      rango(q.eq('source', FUENTE_LISTA)),
    ),
  ]);

  return calcularPanel({ visitas, eventos, inscritos, incluirEquipo });
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
  // Quién es equipo: prefijos conocidos o cualquiera que haya entrado por el link de demo.
  const prefijos = equipo();
  const internos = new Set<string>();
  for (const v of visitas) {
    const id = s(v.anonymous_id);
    if (prefijos.some((p) => id.startsWith(p)) || s(v.referrer).includes(DOMINIO_DEMO)) internos.add(id);
  }
  const vale = (id: unknown) => incluirEquipo || !internos.has(s(id));
  const V = visitas.filter((v) => vale(v.anonymous_id));
  const E = eventos.filter((e) => vale(e.anonymous_id));
  const L = inscritos.filter((l) => vale(l.anonymous_id));

  // Primera visita de cada visitante → país, dispositivo, app, fuente
  const primera = new Map<string, Fila>();
  for (const v of V) if (!primera.has(s(v.anonymous_id))) primera.set(s(v.anonymous_id), v);
  const visitantes = [...primera.keys()];
  const fuente = (v: Fila) => {
    if (s(v.utm_source)) return s(v.utm_source);
    try {
      const host = new URL(s(v.referrer)).hostname.replace(/^www\./, '');
      return host === 'entrenaciencia.com' ? 'Web (inicio)' : host;
    } catch {
      return 'Directo';
    }
  };

  // Embudo por visitante
  const porVisitante = (pred: (e: Fila) => boolean) => new Set(E.filter(pred).map((e) => s(e.anonymous_id)));
  const scroll = (p: number) => porVisitante((e) => /^scroll_\d+$/.test(s(e.event_type)) && Number(s(e.event_type).slice(7)) >= p);
  const inscritosIds = new Set([...porVisitante((e) => e.event_type === 'lista_espera'), ...L.map((l) => s(l.anonymous_id))]);
  const n = visitantes.length;
  const paso = (nombre: string, set: Set<string> | number) => {
    const v = typeof set === 'number' ? set : [...set].filter((id) => primera.has(id)).length;
    return { nombre, n: v, pct: n ? Math.round((v / n) * 1000) / 10 : 0 };
  };
  const embudo = [
    paso('Entraron', n),
    paso('Bajaron al 25%', scroll(25)),
    paso('Bajaron al 50%', scroll(50)),
    paso('Bajaron al 75%', scroll(75)),
    paso('Llegaron al final', scroll(100)),
    paso('Vieron el video', porVisitante((e) => e.event_type === 'video_play')),
    paso('Abrieron testimonios', porVisitante((e) => e.event_type === 'testimonio_ver')),
    paso('Abrieron el registro', porVisitante((e) => e.event_type === 'lista_abrir' || e.event_type === 'cta_click' || e.event_type === 'checkout_click')),
    paso('Se inscribieron', inscritosIds),
  ];

  // Tiempo en página (eventos "salida" = "123s"); se descartan pestañas olvidadas (> 30 min)
  const tiempos = E.filter((e) => e.event_type === 'salida')
    .map((e) => parseInt(s(e.resource_kind), 10))
    .filter((t) => t > 0 && t <= 1800);

  // Serie por día
  const dias = new Map<string, { visitantes: Set<string>; inscritos: number }>();
  const dia = (d: string) => dias.get(d) ?? dias.set(d, { visitantes: new Set(), inscritos: 0 }).get(d)!;
  for (const v of V) dia(diaLima(s(v.created_at))).visitantes.add(s(v.anonymous_id));
  for (const l of L) dia(diaLima(s(l.created_at))).inscritos++;
  const porDia = [...dias.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, d]) => ({ fecha, visitantes: d.visitantes.size, inscritos: d.inscritos }));

  const prim = [...primera.values()];
  const desglose = {
    pais: contar(prim.map((v) => s(v.country) || '?')),
    dispositivo: contar(prim.map((v) => dispositivo(s(v.user_agent), s(v.path)))),
    app: contar(prim.map((v) => app(s(v.user_agent)))),
    fuente: contar(prim.map(fuente)),
    campana: contar(prim.map((v) => s(v.utm_campaign) || '(sin campaña)')),
  };

  const listaInscritos = [...L].reverse().map((l) => {
    const survey = (l.survey ?? {}) as Record<string, unknown>;
    return {
      id: s(l.id),
      fecha: s(l.created_at),
      nombre: ocultarNombre(s(l.name)),
      correo: ocultarCorreo(s(l.email)),
      whatsapp: s(l.whatsapp) ? `${s(l.whatsapp_country_code)} ${ocultarTelefono(s(l.whatsapp))}`.trim() : '',
      pais: s(survey.pais),
      fuente: s(l.utm_source) || s(l.first_touch_utm_source) || 'Directo',
      campana: s(l.utm_campaign),
      equipo: internos.has(s(l.anonymous_id)),
    };
  });

  const NOMBRES: Record<string, string> = {
    scroll_25: 'Bajó al 25%', scroll_50: 'Bajó al 50%', scroll_75: 'Bajó al 75%', scroll_100: 'Llegó al final',
    video_play: 'Dio play al video', testimonio_ver: 'Abrió un testimonio', faq_abrir: 'Abrió una pregunta',
    cta_click: 'Clic en botón', checkout_click: 'Clic en reservar', lista_abrir: 'Abrió el registro',
    lista_espera: 'Se inscribió', salida: 'Salió',
  };
  const actividad = [
    ...V.slice(-40).map((v) => ({ t: s(v.created_at), quien: s(v.anonymous_id).slice(0, 6), que: 'Entró a la página', detalle: `${s(v.country)} · ${dispositivo(s(v.user_agent), s(v.path))} · ${fuente(v)}` })),
    ...E.slice(-60).map((e) => ({ t: s(e.created_at), quien: s(e.anonymous_id).slice(0, 6), que: NOMBRES[s(e.event_type)] ?? s(e.event_type), detalle: s(e.resource_kind) })),
  ]
    .sort((a, b) => b.t.localeCompare(a.t))
    .slice(0, 40);

  return {
    generado: new Date().toISOString(),
    kpis: {
      visitantes: n,
      visitas: V.length,
      sesiones: new Set(V.map((v) => s(v.session_id))).size,
      inscritos: L.length,
      tasaInscripcion: n ? Math.round((inscritosIds.size / n) * 1000) / 10 : 0,
      tiempoMediano: mediana(tiempos),
      excluidos: incluirEquipo ? 0 : internos.size,
    },
    embudo,
    porDia,
    desglose,
    inscritos: listaInscritos,
    actividad,
  };
}

export type DatosPanel = ReturnType<typeof calcularPanel>;

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
