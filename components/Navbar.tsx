'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/#inicio', label: 'Inicio' },
  { href: '/#metodo', label: 'Quiénes somos' },
  { href: '/#recursos', label: 'Recursos' },
  { href: '/#contacto', label: 'Contacto' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''}>
      <a href="/#inicio" className="nav-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="iso" src="/images/isotipo-cyan.png" alt="Entrena con Ciencia" />
        <div className="name">Entrena con <span>Ciencia</span></div>
      </a>

      {/* Desktop nav */}
      <ul className="nav-links desktop-only">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
        <li>
          <a href="/neurociencia" className="nav-cta">
            Nuestro curso
          </a>
        </li>
      </ul>

      {/* Mobile hamburger */}
      <button
        className="mobile-only text-white p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="mobile-only fixed top-[73px] left-0 right-0 px-6 pt-2 pb-6 flex flex-col z-50"
          style={{ background: 'rgba(1, 13, 21, 0.97)', borderTop: '1px solid var(--border-soft)' }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white text-base font-medium py-3 border-b border-white/10"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/neurociencia"
            className="mobile-menu-cta"
            onClick={() => setMenuOpen(false)}
          >
            Nuestro curso
          </a>
        </div>
      )}
    </nav>
  );
}
