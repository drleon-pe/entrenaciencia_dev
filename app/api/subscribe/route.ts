import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Listas donde cada correo puede inscribirse una sola vez.
const UNA_VEZ = new Set(['Lista de espera ECC']);

const PDF_DOWNLOAD_URLS: Record<string, string> = {
  'Pierde Grasa con Ciencia': `${process.env.SUPABASE_URL}/storage/v1/object/public/guides/Entrena%20con%20Ciencia%20-%20Guia%20Perdida%20de%20Peso.pdf`,
  'Proteína con Ciencia':     `${process.env.SUPABASE_URL}/storage/v1/object/public/guides/Entrena%20con%20Ciencia%20-%20Guia%20Proteina.pdf`,
};

function extractCountryCode(whatsapp: string | null): string | null {
  if (!whatsapp) return null;
  const cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');
  const match = cleaned.match(/^\+?(\d{1,3})/);
  return match ? `+${match[1]}` : null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, whatsapp, source, survey } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  // La clave anónima no puede leer leads; la verificación usa la de servicio (solo en el servidor).
  if (source && UNA_VEZ.has(source) && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
    const correo = String(email).trim().replace(/[\\%_]/g, (c) => `\\${c}`);
    const { data, error: errBusca } = await admin
      .from('leads')
      .select('id')
      .eq('source', source)
      .ilike('email', correo)
      .limit(1);
    if (errBusca) console.error('Supabase duplicate check error:', errBusca.message);
    else if (data && data.length) {
      return NextResponse.json({ error: 'ya_registrado' }, { status: 409 });
    }
  }

  const { error } = await supabase.from('leads').insert({
    name:                     name ?? null,
    email,
    whatsapp:                 whatsapp ?? null,
    whatsapp_country_code:    extractCountryCode(whatsapp ?? null),
    source:                   source ?? null,
    survey:                   survey ?? null,
    anonymous_id:             body.anonymous_id ?? null,
    session_id:               body.session_id ?? null,
    utm_source:               body.utm_source ?? null,
    utm_medium:               body.utm_medium ?? null,
    utm_campaign:             body.utm_campaign ?? null,
    utm_content:              body.utm_content ?? null,
    utm_term:                 body.utm_term ?? null,
    first_touch_utm_source:   body.first_touch_utm_source ?? null,
    first_touch_utm_medium:   body.first_touch_utm_medium ?? null,
    first_touch_utm_campaign: body.first_touch_utm_campaign ?? null,
    first_touch_utm_content:  body.first_touch_utm_content ?? null,
    first_touch_utm_term:     body.first_touch_utm_term ?? null,
  });

  if (error) {
    console.error('Supabase insert error:', error.message);
    // Don't block the user — return the download URL even if lead capture fails.
  }

  const downloadUrl = source ? (PDF_DOWNLOAD_URLS[source] ?? null) : null;
  return NextResponse.json({ ok: true, downloadUrl });
}
