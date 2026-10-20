// Métricas que solo tienen las plataformas de anuncios (impresiones, clics, gasto), leídas de sus APIs.
// Se activan solas cuando están las variables en Vercel; sin ellas el panel muestra "sin conectar".
//   Meta:   META_ADS_TOKEN (token de usuario del sistema con ads_read) y META_AD_ACCOUNT_ID (número, con o sin "act_")
//   TikTok: TIKTOK_ADS_TOKEN (access token de la Marketing API) y TIKTOK_ADVERTISER_ID
// Los resultados se guardan 10 minutos en memoria: el panel se refresca cada 5 s y las APIs tienen límite de llamadas.

export type MetricasAnuncio = { impresiones: number; alcance: number | null; clics: number; gasto: number };
export type MetricasPlataforma = {
  conectado: boolean;
  error?: string;
  moneda?: string;
  total: MetricasAnuncio;
  porAnuncio: Record<string, MetricasAnuncio>;
};

const CACHE = new Map<string, { vence: number; valor: MetricasPlataforma }>();
const VIDA = 10 * 60_000;

const vacio = (): MetricasAnuncio => ({ impresiones: 0, alcance: 0, clics: 0, gasto: 0 });
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
/** Mismo criterio que el panel para los nombres que llegan en utm_content. */
const clave = (n: string) => n.replace(/\s+/g, ' ').trim();

function sumar(a: MetricasAnuncio, b: MetricasAnuncio) {
  a.impresiones += b.impresiones;
  a.clics += b.clics;
  a.gasto += b.gasto;
  // El alcance no se puede sumar entre anuncios (una persona puede ver varios); el total lo da la API.
  a.alcance = null;
}

async function conCache(id: string, f: () => Promise<MetricasPlataforma>): Promise<MetricasPlataforma> {
  const c = CACHE.get(id);
  if (c && c.vence > Date.now()) return c.valor;
  const valor = await f();
  CACHE.set(id, { vence: Date.now() + (valor.error ? 60_000 : VIDA), valor });
  return valor;
}

async function meta(desde: string, hasta: string): Promise<MetricasPlataforma> {
  const token = process.env.META_ADS_TOKEN;
  const cuenta = (process.env.META_AD_ACCOUNT_ID ?? '').replace(/^act_/, '');
  if (!token || !cuenta) return { conectado: false, total: vacio(), porAnuncio: {} };
  return conCache(`meta|${desde}|${hasta}`, async () => {
    try {
      const base = `https://graph.facebook.com/v21.0/act_${cuenta}/insights`;
      const rango = JSON.stringify({ since: desde, until: hasta });
      const pedir = async (params: Record<string, string>) => {
        const filas: Record<string, unknown>[] = [];
        let url: string | null = `${base}?${new URLSearchParams({ ...params, time_range: rango, limit: '500', access_token: token })}`;
        for (let i = 0; url && i < 20; i++) {
          const r: Response = await fetch(url, { cache: 'no-store' });
          const j = await r.json();
          if (!r.ok || j.error) throw new Error(j.error?.message ?? `HTTP ${r.status}`);
          filas.push(...(j.data ?? []));
          url = j.paging?.next ?? null;
        }
        return filas;
      };
      const [anuncios, cuentaTotal] = await Promise.all([
        pedir({ level: 'ad', fields: 'ad_name,impressions,reach,inline_link_clicks,spend,account_currency' }),
        pedir({ level: 'account', fields: 'impressions,reach,inline_link_clicks,spend,account_currency' }),
      ]);
      const porAnuncio: Record<string, MetricasAnuncio> = {};
      for (const f of anuncios) {
        const k = clave(String(f.ad_name ?? ''));
        const m = { impresiones: num(f.impressions), alcance: num(f.reach), clics: num(f.inline_link_clicks), gasto: num(f.spend) };
        if (porAnuncio[k]) sumar(porAnuncio[k], m);
        else porAnuncio[k] = m;
      }
      const t = cuentaTotal[0] ?? {};
      return {
        conectado: true,
        moneda: String(t.account_currency ?? anuncios[0]?.account_currency ?? ''),
        total: { impresiones: num(t.impressions), alcance: num(t.reach), clics: num(t.inline_link_clicks), gasto: num(t.spend) },
        porAnuncio,
      };
    } catch (e) {
      return { conectado: true, error: `Meta: ${(e as Error).message}`, total: vacio(), porAnuncio: {} };
    }
  });
}

async function tiktok(desde: string, hasta: string): Promise<MetricasPlataforma> {
  const token = process.env.TIKTOK_ADS_TOKEN;
  const anunciante = process.env.TIKTOK_ADVERTISER_ID;
  if (!token || !anunciante) return { conectado: false, total: vacio(), porAnuncio: {} };
  return conCache(`tiktok|${desde}|${hasta}`, async () => {
    try {
      const filas: Record<string, unknown>[] = [];
      for (let pagina = 1; pagina <= 20; pagina++) {
        const q = new URLSearchParams({
          advertiser_id: anunciante,
          report_type: 'BASIC',
          data_level: 'AUCTION_AD',
          dimensions: JSON.stringify(['ad_id']),
          metrics: JSON.stringify(['ad_name', 'impressions', 'reach', 'clicks', 'spend', 'currency']),
          start_date: desde,
          end_date: hasta,
          page: String(pagina),
          page_size: '1000',
        });
        const r = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${q}`, {
          headers: { 'Access-Token': token },
          cache: 'no-store',
        });
        const j = await r.json();
        if (!r.ok || j.code !== 0) throw new Error(j.message ?? `HTTP ${r.status}`);
        filas.push(...(j.data?.list ?? []));
        const info = j.data?.page_info;
        if (!info || pagina >= num(info.total_page)) break;
      }
      const porAnuncio: Record<string, MetricasAnuncio> = {};
      const total = vacio();
      let moneda = '';
      for (const f of filas) {
        const m = (f.metrics ?? {}) as Record<string, unknown>;
        const k = clave(String(m.ad_name ?? ''));
        const x = { impresiones: num(m.impressions), alcance: num(m.reach), clics: num(m.clicks), gasto: num(m.spend) };
        moneda = moneda || String(m.currency ?? '');
        if (porAnuncio[k]) sumar(porAnuncio[k], x);
        else porAnuncio[k] = x;
        sumar(total, x);
      }
      return { conectado: true, moneda, total, porAnuncio };
    } catch (e) {
      return { conectado: true, error: `TikTok: ${(e as Error).message}`, total: vacio(), porAnuncio: {} };
    }
  });
}

/** Fechas del periodo (YYYY-MM-DD, hora de Lima) para las APIs, que trabajan por días. */
export async function metricasPlataformas(desdeISO: string, hastaISO: string) {
  // Solo en desarrollo: PANEL_API_FIXTURE apunta a un JSON { Meta, TikTok } con la forma de MetricasPlataforma.
  if (process.env.NODE_ENV !== 'production' && process.env.PANEL_API_FIXTURE) {
    const { readFileSync } = await import('fs');
    return JSON.parse(readFileSync(process.env.PANEL_API_FIXTURE, 'utf8')) as Record<'Meta' | 'TikTok', MetricasPlataforma>;
  }
  const dia = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  const desde = dia(desdeISO);
  // "hasta" es exclusivo en el panel: se toma el día del último instante del periodo.
  const hasta = dia(new Date(Math.min(Date.parse(hastaISO), Date.now()) - 1).toISOString());
  const [m, t] = await Promise.all([meta(desde, hasta), tiktok(desde, hasta)]);
  return { Meta: m, TikTok: t };
}
