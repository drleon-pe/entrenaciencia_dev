'use client';

import HexClusters from './HexClusters';

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <HexClusters />

      <div className="hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-iso" src="/images/isotipo-cyan.png" alt="Entrena con Ciencia" />

        <h1>
          <span className="hero-eyebrow-line">Fitness basado en evidencia</span>
          <span className="accent">
            Sin mitos. Sin excusas.<br />
            <span className="hero-yellow">Solo ciencia.</span>
          </span>
        </h1>

        <p className="subhead">
          Lo que funciona para perder grasa y ganar músculo, explicado con estudios — no con opiniones.
        </p>

        <div className="hero-ctas">
          <a href="#recursos" className="btn btn-primary">Recursos gratis</a>
          <a href="/neurociencia" className="btn btn-yellow">Nuestro curso</a>
        </div>
      </div>

      <a href="#why" className="scroll-indicator" aria-label="Desliza hacia abajo">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
    </section>
  );
}
