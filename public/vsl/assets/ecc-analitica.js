/* Analítica de la landing del curso (/vsl).
   Usa el mismo sistema que entrenaciencia.com: mismo anonymous_id, sesión y UTM (primer y último toque),
   y guarda en Supabase por las rutas /api/page-view y /api/resource-events.
   Los pixeles (Meta, GA4, TikTok) se activan solos cuando su ID está escrito abajo. */
(function () {
  'use strict';

  /* ======= IDs de los pixeles: pegar aquí cuando existan (vacío = apagado) ======= */
  var IDS = {
    meta: '2069598364433552',  // Meta Pixel "Entrena con Ciencia - Web" (portafolio Entrena Con Ciencia)
    ga4: '',     // Google Analytics 4, p. ej. 'G-XXXXXXXXXX'
    tiktok: 'D7VLMO3C77U44OJJ0RN0'  // TikTok Pixel "Pagina Web" (Business Center Entrena con Ciencia)
  };
  var RECURSO = 'Landing Curso VSL';

  // En el servidor local no se registra nada (evita ensuciar los datos reales).
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  /* ---------- identidad (igual que lib/identity.ts) ---------- */
  function uuid() {
    try { return crypto.randomUUID(); } catch (e) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
      });
    }
  }
  function aid() {
    try { var id = localStorage.getItem('_aid'); if (!id) { id = uuid(); localStorage.setItem('_aid', id); } return id; } catch (e) { return ''; }
  }
  function sid() {
    try {
      var now = Date.now(), s = localStorage.getItem('_sid'), last = parseInt(localStorage.getItem('_sla') || '0', 10);
      if (s && now - last < 30 * 60 * 1000) { localStorage.setItem('_sla', String(now)); return s; }
      s = uuid(); localStorage.setItem('_sid', s); localStorage.setItem('_sla', String(now)); return s;
    } catch (e) { return ''; }
  }

  /* ---------- UTM (igual que lib/utm.ts) ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  function capturarUtm() {
    var p = new URLSearchParams(location.search), u = {};
    KEYS.forEach(function (k) { var v = p.get(k); if (v) u[k] = v; });
    if (!Object.keys(u).length) return;
    try {
      sessionStorage.setItem('_utm', JSON.stringify(u));
      if (!localStorage.getItem('_utm_first')) localStorage.setItem('_utm_first', JSON.stringify(u));
    } catch (e) {}
  }
  function leer(store, key) { try { return JSON.parse(store.getItem(key) || '{}') || {}; } catch (e) { return {}; } }
  function atribucion() {
    var l = leer(sessionStorage, '_utm'), f = leer(localStorage, '_utm_first'), o = {};
    KEYS.forEach(function (k) { o[k] = l[k] || null; o['first_touch_' + k] = f[k] || null; });
    return o;
  }
  function extend(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }

  function enviar(ruta, datos) {
    if (LOCAL) return;
    var body = JSON.stringify(datos);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ruta, new Blob([body], { type: 'application/json' }))) return;
    } catch (e) {}
    try { fetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }); } catch (e) {}
  }

  /* ---------- pixeles ---------- */
  function cargarPixeles() {
    if (LOCAL) return;
    /* Vercel Web Analytics (activado en el proyecto): visitas, páginas, países, UTM y eventos clave */
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    var v = document.createElement('script'); v.defer = true; v.src = '/_vercel/insights/script.js'; document.head.appendChild(v);
    if (IDS.ga4) {
      var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + IDS.ga4; document.head.appendChild(g);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', IDS.ga4);
    }
    if (IDS.meta) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', IDS.meta); window.fbq('track', 'PageView'); window.fbq('track', 'ViewContent', { content_name: 'Curso Entrena con Ciencia' });
    }
    if (IDS.tiktok) {
      !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }; ttq.load = function (e, n) { var i = 'https://analytics.tiktok.com/i18n/pixel/events.js'; ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = d.createElement('script'); o.type = 'text/javascript', o.async = !0, o.src = i + '?sdkid=' + e + '&lib=' + t; var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a) }; ttq.load(IDS.tiktok); ttq.page() }(window, document, 'ttq');
      window.ttq.track('ViewContent', { content_name: 'Curso Entrena con Ciencia' });
    }
  }

  /* Un evento va a Supabase y, si están activos, a Meta / GA4 / TikTok con su nombre estándar. */
  function evento(tipo, extra, meta, ga, tt) {
    enviar('/api/resource-events', extend(extend({
      event_type: tipo, resource_title: RECURSO, resource_kind: extra || null,
      anonymous_id: aid(), session_id: sid()
    }, atribucion()), {}));
    if (LOCAL) return;
    /* a Vercel solo los eventos que mueven el negocio (el plan incluye eventos con 2 propiedades) */
    if (/^(checkout_click|cta_click|video_play|scroll_75)$/.test(tipo) && window.va) {
      try { window.va('event', { name: tipo, data: { detalle: (extra || '').slice(0, 100), fuente: (atribucion().utm_source || 'directo') } }); } catch (e) {}
    }
    try {
      if (meta && window.fbq) window.fbq(meta[0] === '!' ? 'trackCustom' : 'track', meta.replace('!', ''), { content_name: 'Curso Entrena con Ciencia', detalle: extra || '' });
      if (ga && window.gtag) window.gtag('event', ga, { detalle: extra || '' });
      if (tt && window.ttq) window.ttq.track(tt, { content_name: 'Curso Entrena con Ciencia' });
    } catch (e) {}
  }
  window.eccEvento = evento;

  /* ---------- arranque ---------- */
  capturarUtm();
  cargarPixeles();
  enviar('/api/page-view', extend({
    anonymous_id: aid(), session_id: sid(), path: location.pathname,
    referrer: document.referrer || null, user_agent: navigator.userAgent
  }, atribucion()));

  /* Profundidad de scroll: 25, 50, 75 y 100 %, una vez cada una. */
  var hitos = [25, 50, 75, 100], hechos = {};
  addEventListener('scroll', function () {
    var h = document.documentElement, p = (scrollY + innerHeight) / Math.max(1, h.scrollHeight) * 100;
    hitos.forEach(function (m) { if (p >= m - 1 && !hechos[m]) { hechos[m] = 1; evento('scroll_' + m, null, m === 75 ? '!Scroll75' : null, 'scroll_' + m); } });
  }, { passive: true });

  /* Clics: video, botones de compra/reserva, testimonios y preguntas. */
  var vioVideo = false;
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var cta = t.closest('a.ecc-cta, .m-cta-barra-btn, a[href="#empezar"], [data-ecc-checkout]');
    if (cta) {
      var texto = (cta.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      var seccion = (cta.closest('section[data-screen-label]') || {}).dataset;
      var donde = seccion ? seccion.screenLabel : (cta.closest('.m-cta-barra') ? 'barra inferior' : 'otro');
      /* Intento de compra solo cuando lleva al pago; los que bajan a la oferta cuentan como clic al CTA. */
      if (cta.hasAttribute('data-ecc-checkout')) {
        evento('checkout_click', donde + ' · ' + texto, 'InitiateCheckout', 'begin_checkout', 'InitiateCheckout');
        /* Al pago de Hotmart se le pasa el origen: src = fuente del anuncio, sck = campaña|id de la persona (une la venta con su visita) */
        try {
          var at = atribucion(), u = new URL(cta.href);
          u.searchParams.set('src', (at.utm_source || at.first_touch_utm_source || 'directo').slice(0, 30));
          u.searchParams.set('sck', [(at.utm_campaign || at.first_touch_utm_campaign || 'sin_campana').slice(0, 40), aid()].join('|'));
          if (!LOCAL) { e.preventDefault(); var destino = u.toString(); setTimeout(function () { location.href = destino; }, 250); }
          else cta.href = u.toString();
        } catch (er) {}
      }
      else evento('cta_click', donde + ' · ' + texto, '!ClicCTA', 'cta_click', 'ClickButton');
      return;
    }
    if (!vioVideo && t.closest('.ecc-vsl-play, section[data-screen-label^="01"] image-slot, section[data-screen-label^="01"] video, section[data-screen-label^="01"] iframe')) {
      vioVideo = true; evento('video_play', 'VSL', '!VideoPlay', 'video_start', 'ClickButton'); return;
    }
    if (t.closest('.ecc-testi-btn, .ecc-hero-testi')) { evento('testimonio_ver', t.closest('.ecc-hero-testi') ? 'franja inicio' : 'catálogo', null, 'testimonial_view'); return; }
    var faq = t.closest('section[data-screen-label^="05"] [onclick], section[data-screen-label^="05"] div[style*="cursor:pointer"]');
    if (faq) { evento('faq_abrir', (faq.textContent || '').trim().slice(0, 80), null, 'faq_open'); }
  }, true);

  /* Tiempo en la página al salir (segundos). */
  var t0 = Date.now(), salio = false;
  function alSalir() { if (salio) return; salio = true; evento('salida', String(Math.round((Date.now() - t0) / 1000)) + 's'); }
  addEventListener('pagehide', alSalir);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') alSalir(); });
})();
