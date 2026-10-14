import fs from 'node:fs';
import path from 'node:path';
import {
  goalLabels,
  activityLabels,
  macroSplitLabels,
  goalAdjustment,
  WEEKLY_GOAL_PCT,
  LOSS_GOALS,
} from '@/lib/calorieCalculator';
import type { ReportProps } from './sections';

/* ── Fonts (loaded once at module init, embedded as base64) ──────────── */

const FONT_DIR = path.join(process.cwd(), 'lib', 'email', 'fonts');

function loadB64(file: string): string {
  try { return fs.readFileSync(path.join(FONT_DIR, file)).toString('base64'); }
  catch { console.warn('[reportHtml] font not found:', file); return ''; }
}

const F = {
  xl: loadB64('Poppins-ExtraLight.ttf'), // weight 200
  md: loadB64('Poppins-Medium.ttf'),     // weight 500
  bd: loadB64('Poppins-Bold.ttf'),       // weight 700
  xb: loadB64('Poppins-ExtraBold.ttf'), // weight 800
};

/* Brand isotipo, inlined so it's available at screenshot time. */
const LOGO_B64 = (() => {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), 'public', 'images', 'isotipo-cyan.png'),
    ).toString('base64');
  } catch {
    console.warn('[reportHtml] logo not found: isotipo-cyan.png');
    return '';
  }
})();

/* ── Donut arc helpers ───────────────────────────────────────────────── */

function descArc(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function buildDonut(
  cx: number, cy: number, r: number, sw: number,
  segs: Array<{ pct: number; color: string }>,
): string {
  const total = segs.reduce((s, x) => s + x.pct, 0) || 1;
  const GAP = 0.015;
  let cur = -Math.PI / 2;
  const out = [`<circle cx="${cx}" cy="${cy}" r="${r}" stroke="#eef3f6" stroke-width="${sw}" fill="none"/>`];
  for (const s of segs) {
    const sweep = (s.pct / total) * 2 * Math.PI;
    if (sweep > GAP * 2) {
      out.push(`<path d="${descArc(cx, cy, r, cur + GAP / 2, cur + sweep - GAP / 2)}" stroke="${s.color}" stroke-width="${sw}" stroke-linecap="butt" fill="none"/>`);
    }
    cur += sweep;
  }
  return out.join('');
}

/* ── Integer percentages (largest-remainder method) ─────────────────── */

function pctInts(fracs: number[]): number[] {
  const raw = fracs.map(f => f * 100);
  const fl  = raw.map(Math.floor);
  const rem = Math.round(100 - fl.reduce((a, b) => a + b, 0));
  const ord = raw.map((p, i) => ({ i, r: p - fl[i] })).sort((a, b) => b.r - a.r);
  const out = [...fl];
  for (let k = 0; k < rem && k < ord.length; k++) out[ord[k].i]++;
  return out;
}

/* ── Locale formatter ────────────────────────────────────────────────── */

function fN(n: number): string { return n.toLocaleString('es-MX'); }

/* ── Main builder ────────────────────────────────────────────────────── */

export function buildReportHtml({ name, inputs, result }: ReportProps): string {
  const dateLabel = new Date().toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  /* Goal text */
  const isLoss = LOSS_GOALS.includes(inputs.goal);
  const isGain = inputs.goal === 'leve_gain' || inputs.goal === 'gain';
  const weeklyKg = Math.abs(inputs.weight * WEEKLY_GOAL_PCT[inputs.goal]);
  const goalShort = isLoss ? 'pérdida de peso' : isGain ? 'ganancia de masa' : 'mantenimiento';
  const goalRateText = inputs.goal === 'maintain'
    ? ''
    : `${isLoss ? '−' : '+'}${weeklyKg.toFixed(2)} kg/semana.`;

  /* Macros */
  const [pInt, cInt, fInt] = pctInts([result.proteinPct, result.carbsPct, result.fatPct]);

  /* Adjustment */
  const adjKcal = Math.round(goalAdjustment(inputs.weight, inputs.goal));
  const adjAbs  = Math.abs(adjKcal);

  /* Units */
  const imp  = inputs.units === 'imperial';
  const wVal = imp ? (inputs.weight / 0.45359237).toFixed(0) : inputs.weight.toFixed(0);
  const wU   = imp ? 'lb' : 'kg';
  const hVal = imp ? (inputs.height / 2.54).toFixed(0) : inputs.height.toFixed(0);
  const hU   = imp ? 'in' : 'cm';

  /* Data labels */
  const dataSex      = inputs.sex === 'male' ? 'Masculino' : 'Femenino';
  const dataActivity = activityLabels[inputs.activity].title;
  const dataMacro    = macroSplitLabels[inputs.macroSplit].title;
  let   goalDataHtml: string;
  if (inputs.goal === 'maintain') {
    goalDataHtml = 'Mantenimiento';
  } else {
    const dir = isLoss ? 'Pérdida de peso' : 'Ganancia de masa';
    goalDataHtml = `${dir} —<br>${isLoss ? '' : '+'}${weeklyKg.toFixed(2)} kg/sem`;
  }

  /* Donut — center (297.72, 366.22), outer R≈42.6, inner R≈30 → stroke midpoint R=36, sw=13 */
  const donut = buildDonut(297.72, 366.22, 36, 13, [
    { pct: result.proteinPct, color: '#23d3ff' },
    { pct: result.carbsPct,   color: '#ffc300' },
    { pct: result.fatPct,     color: '#9ce2b6' },
  ]);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Personalizado — Entrena con Ciencia</title>
<style>
  @font-face { font-family: 'Poppins'; font-weight: 200; font-display: block; src: url('data:font/ttf;base64,${F.xl}') format('truetype'); }
  @font-face { font-family: 'Poppins'; font-weight: 500; font-display: block; src: url('data:font/ttf;base64,${F.md}') format('truetype'); }
  @font-face { font-family: 'Poppins'; font-weight: 700; font-display: block; src: url('data:font/ttf;base64,${F.bd}') format('truetype'); }
  @font-face { font-family: 'Poppins'; font-weight: 800; font-display: block; src: url('data:font/ttf;base64,${F.xb}') format('truetype'); }

  :root {
    --bl: -0.80em;
    --blue:   #017ea7;
    --yellow: #fec200;
    --yellow2:#ffc300;
    --ink:    #010c15;
    --white:  #fbfcfd;
    --cyan:   #23d3ff;
    --green:  #9ce2b6;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #fff; }

  @page { size: A4; margin: 0; }
  body.size-a4 {
    --fit: 1.334; --sheet-w: 210mm; --sheet-h: 297mm;
    --crop-w: 595px; --crop-h: 804.24px; --crop-x: -126.84px; --crop-y: -51.76px;
  }

  .sheet { width: var(--sheet-w); height: var(--sheet-h); background: #fff; display: flex; align-items: flex-start; justify-content: center; overflow: hidden; }
  .crop  { flex: none; overflow: hidden; width: calc(var(--crop-w) * var(--fit)); height: calc(var(--crop-h) * var(--fit)); }
  .page  { transform: scale(var(--fit,1)) translate(var(--crop-x,0px),var(--crop-y,0px)); transform-origin: top left; }

  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }

  .page {
    position: relative; width: 784.29px; height: 862.04px;
    background: #fff; overflow: hidden; font-family: 'Poppins', sans-serif;
  }

  /* Baseline correction: shift text up by ~0.8em so the visual baseline
     aligns with the absolute top coordinate. Uses margin-top instead of
     transform: translateY() because Chromium flattens margins into final
     box positions during print layout, while transforms get emitted as
     content-stream matrices that iOS PDFKit may ignore — which causes
     every text label to drop out of its box on iPhone/iPad. */
  .t  { position: absolute; line-height: 1; white-space: nowrap; margin-top: var(--bl); }
  .tc { text-align: center; white-space: nowrap; }

  .f-title    { font-size: 18px; font-weight: 800; color: var(--white); }
  .f-subtitle { font-size: 18px; font-weight: 800; color: var(--yellow); }
  .f-date     { font-size: 13px; font-weight: 200; color: var(--white); }
  .f-h12      { font-size: 12px; font-weight: 800; color: var(--blue); }
  .f-med10    { font-size: 10px; font-weight: 500; color: var(--blue); }
  .f-xb10     { font-size: 10px; font-weight: 800; color: var(--blue); }
  .f-xb15     { font-size: 15px; font-weight: 800; color: var(--blue); }
  .f-med9     { font-size:  9px; font-weight: 500; color: var(--blue); }
  .f-bold10   { font-size: 10px; font-weight: 700; color: var(--blue); }
  .f-xl10     { font-size: 10px; font-weight: 200; color: var(--blue); }
  .f-xb17     { font-size: 17px; font-weight: 800; color: var(--blue); }
  .f-note     { font-size:  9px; font-weight: 700; color: #000; }
  .f-legal    { font-size:  9px; font-weight: 200; color: #000; }
  .f-foot-w   { font-size: 14px; font-weight: 800; color: var(--white); }
  .f-foot-y   { font-size: 14px; font-weight: 800; color: var(--yellow); }
  .f-btn      { font-size: 14px; font-weight: 500; color: var(--ink); }
  .f-wait     { font-size:  9px; font-weight: 500; color: var(--yellow); }
  .g-unit     { font-weight: 500; }

  .hero {
    position: absolute; left: 126.84px; top: 51.76px;
    width: 595px; height: 420.49px;
    background: linear-gradient(180deg,#017ea7 0%,#015370 31%,#012c3e 63%,#011420 87%,#010c15 100%);
    overflow: hidden;
  }
  .hero > svg { position: absolute; inset: 0; }

  .card {
    position: absolute; left: 164.26px; top: 237.01px;
    width: 516.65px; height: 579.97px;
    background: linear-gradient(90deg,#ffffff 0%,#e3eff2 100%);
    border: 1px solid #cfe6ee; border-radius: 13.15px;
    box-shadow: 0 16px 36px rgba(1,75,99,.16);
  }
  .goal-pill {
    position: absolute; left: 193.69px; top: 280.14px;
    width: 450.67px; height: 32.14px;
    background: linear-gradient(135deg,#ffffff 0%,#e3eff2 100%);
    border: 1px solid var(--blue); border-radius: 5.4px;
    box-shadow: 0 5px 12px rgba(1,75,99,.14);
  }
  .calories-card {
    position: absolute; left: 459.26px; top: 451.32px;
    width: 127px; height: 59.98px;
    background: linear-gradient(135deg,#ffffff 0%,#e3eff2 100%);
    border: 1px solid var(--blue); border-radius: 5.4px;
    box-shadow: 0 7px 16px rgba(1,75,99,.16);
  }
  .footer-card {
    position: absolute; left: 177.91px; top: 721.9px;
    width: 489.36px; height: 81.19px;
    background: var(--ink); border-radius: 11.74px;
  }
  .cta-button {
    position: absolute; left: 465.96px; top: 740.41px;
    width: 182.98px; height: 32.72px;
    background: var(--yellow2); border-radius: 3.7px;
    box-shadow: 0 5px 12px rgba(0,0,0,.45);
  }
  .deco { position: absolute; inset: 0; width: 784.29px; height: 862.04px; pointer-events: none; }
  .hex-glow { filter: drop-shadow(0 5px 9px rgba(1,75,99,.45)); }
</style>
</head>
<body class="size-a4">
<div class="sheet"><div class="crop"><div class="page">

  <!-- Hero gradient + hexagon pattern -->
  <div class="hero">
    <svg viewBox="126.84 51.76 595 420.49" width="595" height="420.49" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path opacity=".08" fill="#017ea7" d="M736.03,440.01c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM736.03,333.27c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M640.72,440.01c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM640.72,333.27c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M687.78,357.42c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.01,11.32,0l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM687.78,250.67c-1.75,0-3.5.45-5.06,1.35l-36.94,21.33c-3.12,1.8-5.06,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.06-5.17,5.06-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M421.16,208.19c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.02-11.32,0l-36.94-21.33c-3.49-2.01-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM421.16,314.93c1.75,0,3.5-.45,5.07-1.35l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.07-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M516.48,208.19c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.02-11.32,0l-36.94-21.33c-3.49-2.01-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM516.48,314.93c1.75,0,3.5-.45,5.07-1.35l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.07-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M469.41,290.78c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.01-11.32,0l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM469.41,397.52c1.75,0,3.5-.45,5.06-1.35l36.94-21.33c3.12-1.8,5.06-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.06,5.17-5.06,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M661.24,190.52c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM661.24,83.78c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M565.92,190.52c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM565.92,83.78c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M612.99,107.93c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM612.99,1.19c-1.75,0-3.5.45-5.06,1.35l-36.94,21.33c-3.12,1.8-5.06,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.06-5.17,5.06-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M363.12,500.91c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM363.12,394.16c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M267.81,500.91c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM267.81,394.16c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M314.88,418.31c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.01,11.32,0l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM314.88,311.57c-1.75,0-3.5.45-5.06,1.35l-36.94,21.33c-3.12,1.8-5.06,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.06-5.17,5.06-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M48.26,269.09c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.02-11.32,0l-36.94-21.33c-3.49-2.01-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM48.26,375.83c1.75,0,3.5-.45,5.07-1.35l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.07-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M143.57,269.09c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.02-11.32,0l-36.94-21.33c-3.49-2.01-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM143.57,375.83c1.75,0,3.5-.45,5.07-1.35l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.07-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M96.5,351.68c1.96,0,3.91.5,5.66,1.51l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-3.49,2.02-7.83,2.01-11.32,0l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c1.75-1.01,3.7-1.51,5.66-1.51ZM96.5,458.42c1.75,0,3.5-.45,5.06-1.35l36.94-21.33c3.12-1.8,5.06-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-3.12-1.8-7.01-1.8-10.13,0l-36.94,21.33c-3.12,1.8-5.06,5.17-5.06,8.77v42.65c0,3.61,1.94,6.97,5.06,8.77l36.94,21.33c1.56.9,3.31,1.35,5.07,1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M288.33,251.42c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM288.33,144.68c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".08" fill="#017ea7" d="M193.02,251.42c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.01,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM193.02,144.68c-1.75,0-3.5.45-5.07,1.35l-36.94,21.33c-3.12,1.8-5.07,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.07-5.17,5.07-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
      <path opacity=".05" fill="#017ea7" d="M240.08,168.83c-1.96,0-3.91-.5-5.66-1.51l-36.94-21.33c-3.49-2.02-5.66-5.77-5.66-9.8v-42.65c0-4.03,2.17-7.79,5.66-9.8l36.94-21.33c3.49-2.02,7.83-2.02,11.32,0l36.94,21.33c3.49,2.02,5.66,5.77,5.66,9.8v42.65c0,4.03-2.17,7.79-5.66,9.8l-36.94,21.33c-1.75,1.01-3.7,1.51-5.66,1.51ZM240.08,62.09c-1.75,0-3.5.45-5.06,1.35l-36.94,21.33c-3.12,1.8-5.06,5.17-5.07,8.77v42.65c0,3.61,1.94,6.97,5.07,8.77l36.94,21.33c3.12,1.8,7.01,1.8,10.13,0l36.94-21.33c3.12-1.8,5.06-5.17,5.06-8.77v-42.65c0-3.61-1.94-6.97-5.06-8.77l-36.94-21.33c-1.56-.9-3.31-1.35-5.07-1.35Z"/>
    </svg>
  </div>

  <!-- Brand isotipo -->
  <img src="data:image/png;base64,${LOGO_B64}" alt=""
       style="position:absolute;left:399.34px;top:90px;width:50px;height:50px;"/>

  <!-- Header text -->
  <div class="t tc f-title"    style="left:126.84px;top:168.24px;width:595px;">Entrena con Ciencia</div>
  <div class="t tc f-subtitle" style="left:126.84px;top:192.73px;width:595px;">Reporte Personalizado</div>
  <div class="t tc f-date"     style="left:126.84px;top:216.71px;width:595px;">Generado el ${dateLabel}</div>

  <!-- Card background -->
  <div class="card"></div>

  <!-- Greeting -->
  <div class="t f-h12" style="left:197.52px;top:272.21px;">Hola, ${name}.</div>

  <!-- Goal pill -->
  <div class="goal-pill"></div>
  <div class="t f-med10" style="left:202.76px;top:300.19px;">Esto es lo que calculamos para tu objetivo de ${goalShort}</div>
  <div class="t f-xb10"  style="left:530px;top:299.92px;">${goalRateText}</div>

  <!-- Donut center labels -->
  <div class="t tc f-xb15" style="left:255.12px;top:366.46px;width:85.2px;">${fN(result.calories)}</div>
  <div class="t tc f-med9"  style="left:255.12px;top:378.83px;width:85.2px;">kcal/día</div>

  <!-- Macro legend -->
  <div class="t f-med10" style="left:413.49px;top:341.55px;">Proteína</div>
  <div class="t f-xb10"  style="left:506.43px;top:341.55px;">${result.protein} <span class="g-unit">g</span></div>
  <div class="t f-med10" style="left:557.39px;top:341.55px;">${pInt}%</div>

  <div class="t f-med10" style="left:413.49px;top:369.94px;">Carbohidratos</div>
  <div class="t f-xb10"  style="left:505.39px;top:369.94px;">${result.carbs} <span class="g-unit">g</span></div>
  <div class="t f-med10" style="left:557.04px;top:369.94px;">${cInt}%</div>

  <div class="t f-med10" style="left:413.49px;top:397.54px;">Grasa</div>
  <div class="t f-xb10"  style="left:505.39px;top:397.54px;">${result.fat} <span class="g-unit">g</span></div>
  <div class="t f-med10" style="left:557.39px;top:397.54px;">${fInt}%</div>

  <!-- Breakdown section heading -->
  <div class="t f-h12" style="left:197.5px;top:431.72px;">Como calculamos tus calorías</div>

  <!-- Hex labels -->
  <div class="t tc f-med10"  style="left:223.4px;top:520.59px;width:120px;">Gasto Calórico</div>
  <div class="t tc f-bold10" style="left:223.4px;top:534.76px;width:120px;">${fN(result.tdee)}</div>
  <div class="t tc f-xl10"   style="left:223.4px;top:548.54px;width:120px;">kcal</div>

  <div class="t tc f-med10"  style="left:323.6px;top:520.59px;width:120px;">Ajuste</div>
  <div class="t tc f-bold10" style="left:323.6px;top:534.76px;width:120px;">${fN(adjAbs)}</div>
  <div class="t tc f-xl10"   style="left:323.6px;top:548.54px;width:120px;">kcal</div>

  <!-- Calories result card -->
  <div class="calories-card"></div>
  <div class="t tc f-xl10"  style="left:459.26px;top:466.31px;width:127px;">Calorías diarias</div>
  <div class="t tc f-xb17"  style="left:459.26px;top:486.98px;width:127px;">${fN(result.calories)}</div>
  <div class="t tc f-med10" style="left:459.26px;top:502.38px;width:127px;">kcal/día</div>

  <!-- Tus datos -->
  <div class="t f-h12" style="left:196.67px;top:573.72px;">Tus datos</div>

  <div class="t f-xl10"   style="left:213.31px;top:596.96px;">Sexo</div>
  <div class="t f-bold10" style="left:213.31px;top:607.22px;">${dataSex}</div>
  <div class="t f-xl10"   style="left:213.31px;top:626.43px;">Peso</div>
  <div class="t f-bold10" style="left:213.31px;top:637.29px;">${wVal} ${wU}</div>
  <div class="t f-xl10"   style="left:213.31px;top:653.47px;">Talla</div>
  <div class="t f-bold10" style="left:213.31px;top:664.41px;">${hVal} ${hU}</div>

  <div class="t f-xl10"   style="left:346.26px;top:596.96px;">Edad</div>
  <div class="t f-bold10" style="left:346.26px;top:607.64px;">${inputs.age} años</div>
  <div class="t f-xl10"   style="left:346.26px;top:626.43px;">Reparto macros</div>
  <div class="t f-bold10" style="left:346.26px;top:637px;">${dataMacro}</div>
  <div class="t f-xl10"   style="left:346.26px;top:653.8px;">Actividad</div>
  <div class="t f-bold10" style="left:346.26px;top:664.33px;">${dataActivity}</div>

  <div class="t f-xl10" style="left:491.08px;top:596.96px;">Objetivo</div>
  <div class="f-bold10" style="position:absolute;left:491.08px;top:599.1px;line-height:12px;width:140px;">${goalDataHtml}</div>

  <!-- Methodology note -->
  <div class="f-note" style="position:absolute;left:164.26px;top:683.5px;width:516.65px;line-height:10.8px;text-align:center;">
    Estos resultados son una estimación basada en ecuaciones predictivas y modelos<br>
    poblacionales. Úsalos como punto de partida y ajústalos según tu progreso real<br>
    durante las próximas 2–3 semanas.
  </div>

  <!-- Footer CTA -->
  <div class="footer-card"></div>
  <div class="t f-foot-w" style="left:260.79px;top:756.77px;">Inscribete al </div>
  <div class="t f-foot-y" style="left:260.79px;top:773.13px;">Curso de Fundamentos</div>
  <div class="cta-button"></div>
  <div class="t tc f-btn"  style="left:465.96px;top:761.64px;width:182.98px;">QUIERO INSCRIBIRME</div>
  <div class="t tc f-wait" style="left:465.96px;top:790.9px; width:182.98px;">Lista de espera abierta</div>
  <!-- Clickable overlay covering the yellow button. data-cta is read at PDF
       render time so we can re-create a real link annotation in pdf-lib after
       rasterization (the <a> itself doesn't survive the screenshot step). -->
  <a href="https://www.entrenaciencia.com/neurociencia" data-cta="curso"
     style="position:absolute;left:465.96px;top:740.41px;width:182.98px;height:62px;display:block;z-index:10;"></a>

  <!-- Legal note -->
  <div class="f-legal" style="position:absolute;left:164.26px;top:832.4px;width:516.65px;line-height:10.8px;text-align:center;">
    No constituye diagnóstico ni reemplaza la valoración clínica individual. Si tienes condiciones<br>
    médicas o tomas medicamentos, consulta con un profesional.
  </div>

  <!-- Decorative SVG layer -->
  <svg class="deco" viewBox="0 0 784.29 862.04" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- goal-pill dash separator -->
    <line x1="533.11" y1="296.49" x2="537.63" y2="296.49" stroke="#017ea7" stroke-linecap="round" stroke-width="1"/>

    <!-- Donut chart (dynamic) -->
    <g>${donut}</g>

    <!-- Macro legend dots -->
    <circle cx="402.83" cy="337.85" r="4.43" fill="#23d3ff"/>
    <circle cx="402.83" cy="366.24" r="4.43" fill="#ffc300"/>
    <circle cx="402.83" cy="393.84" r="4.43" fill="#9ce2b6"/>

    <!-- Legend row separators -->
    <line x1="398.4" y1="351.92" x2="587.15" y2="351.92" stroke="#017ea7" stroke-width="1" stroke-miterlimit="10"/>
    <line x1="398.4" y1="380.29" x2="587.15" y2="380.29" stroke="#017ea7" stroke-width="1" stroke-miterlimit="10"/>

    <!-- Hex 1: gasto calórico -->
    <g class="hex-glow">
      <path fill="#017ea7" d="M257.11,466.75v19.84c0,3.47,1.85,6.68,4.86,8.41l17.18,9.92c3.01,1.73,6.71,1.73,9.71,0l17.18-9.92c3.01-1.73,4.86-4.94,4.86-8.41v-19.84c0-3.47-1.85-6.68-4.86-8.41l-17.18-9.92c-3.01-1.73-6.71-1.73-9.71,0l-17.18,9.92c-3.01,1.73-4.86,4.94-4.86,8.41Z"/>
      <g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M270.96,481.63c-3.22-6.3-.9-13.53,4.87-17.36,5.97-3.97,14.24-2.6,18.69,3.23"/>
        <path d="M273.46,485.75c4.25,5.66,12.11,7.23,18.08,3.73,6.19-3.63,8.58-11.65,5.29-18.21"/>
        <polyline points="272.67 487.82 272.67 484.86 275.68 485.26"/>
        <polyline points="295.41 465.56 295.41 468.52 292.4 468.12"/>
        <path d="M277.89,473.84c-.83,1.83-1.13,3.58-.81,5.59.36,2.29,1.96,3.86,4.14,4.53,3.28.96,6.88-.03,8.3-3.36,1.48-3.45-.28-7.08-2.53-9.69-.14-.17-.51-.72-.7-.68-.1.02-.27.25-.35.31l-1.08.97-.64.57-3.08-3.76-2.1,3.37"/>
        <path d="M285.95,476.44l-.99-1.58-1.26,1.81-1.38-2.83s-3.04,4.2-1.39,6.18,3.8,1.06,3.8,1.06c0,0,1.81-.5,1.83-2.6"/>
      </g>
    </g>

    <!-- + operator -->
    <g stroke="#017ea7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="329.28" y1="476.67" x2="339.74" y2="476.67"/>
      <line x1="334.51" y1="481.9"  x2="334.51" y2="471.43"/>
    </g>

    <!-- Hex 2: ajuste -->
    <g class="hex-glow">
      <path fill="#017ea7" d="M356.74,466.73v19.84c0,3.47,1.85,6.68,4.86,8.41l17.18,9.92c3.01,1.73,6.71,1.73,9.71,0l17.18-9.92c3.01-1.73,4.86-4.94,4.86-8.41v-19.84c0-3.47-1.85-6.68-4.86-8.41l-17.18-9.92c-3.01-1.73-6.71-1.73-9.71,0l-17.18,9.92c-3.01,1.73-4.86,4.94-4.86,8.41Z"/>
      <g fill="none" stroke="#fff" stroke-width="1.5" stroke-miterlimit="10">
        <path d="M377.13,466.87c.56-.39,1.4-.95,2.23-1.37.49-.24.81-.74.79-1.29l-.05-2.09c-.02-.76.58-1.39,1.34-1.42l4.48-.14c.74-.02,1.36.53,1.42,1.27l.24,2.9c.04.44.28.84.66,1.07l1.82,1.11c.43.26.97.27,1.41.02l2.4-1.37c.67-.39,1.53-.14,1.9.54l2.41,4.45c.35.64.14,1.43-.47,1.82l-2.35,1.51c-.42.27-.66.74-.63,1.24l.1,1.91c.02.42.23.81.57,1.05l2.39,1.72c.57.41.74,1.19.39,1.81l-2.27,3.99c-.38.68-1.25.9-1.92.5l-2.05-1.24c-.41-.25-.93-.27-1.36-.04l-2.21,1.16c-.46.24-.74.71-.74,1.23v3.03c0,.79-.66,1.42-1.45,1.38l-5.44-.27c-.76-.04-1.35-.69-1.31-1.45l.13-2.5c.02-.46-.19-.9-.56-1.18l-1.79-1.33c-.44-.33-1.04-.36-1.52-.09l-2.31,1.34c-.66.38-1.5.16-1.89-.49l-2.4-4.06c-.37-.63-.19-1.44.42-1.85l2.47-1.67c.35-.24.58-.62.61-1.05l.17-2.42c.04-.6-.31-1.16-.87-1.38l-1.95-.77c-.79-.31-1.11-1.25-.69-1.98l2.36-4.04c.36-.62,1.14-.86,1.79-.55l2.33,1.12c.45.22.98.17,1.39-.12Z"/>
        <circle cx="383.64" cy="476.09" r="7.17"/>
      </g>
    </g>

    <!-- = operator -->
    <g stroke="#017ea7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="430.66" y1="478.51" x2="441.13" y2="478.51"/>
      <line x1="430.66" y1="475.08" x2="441.13" y2="475.08"/>
    </g>

    <!-- Grad-cap icon (footer) -->
    <g fill="none" stroke="#23d3ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="221.69 747.49 203.16 755.59 221.89 763.88 238.24 755.18 221.69 747.49"/>
      <circle cx="206.64" cy="767.79" r="2.01"/>
      <path d="M210.86,759.46v10.55s9.04,7.71,21.65,0c.05-3.37,0-11.54,0-11.54"/>
      <line x1="206.64" y1="757.5" x2="206.64" y2="765.78"/>
    </g>
  </svg>

</div></div></div>
</body>
</html>`;
}
