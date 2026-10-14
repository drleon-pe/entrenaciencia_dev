'use client';

import { useState } from 'react';
import EmailModal from './EmailModal';
import { getTrackingContext } from '@/lib/tracking';

type ResourceKind = 'pdf' | 'internal' | 'course';

interface Resource {
  tag: string;
  title: string;
  description: string;
  actionLabel: string;
  kind: ResourceKind;
  href?: string;
  coming?: boolean;
  disabled?: boolean;
}

const resources: Resource[] = [
  {
    tag: 'Nutrición',
    title: 'Pierde Grasa con Ciencia',
    description: 'Qué es el déficit calórico, cómo funciona, los mitos que te están frenando, y cómo aplicar lo que la evidencia dice para perder grasa de manera sostenible.',
    actionLabel: 'Descargar',
    kind: 'pdf',
  },
  {
    tag: 'Nutrición',
    title: 'Proteína con Ciencia',
    description: 'Qué es la proteína, para qué sirve, los mitos que la rodean, y cómo aplicar lo que la evidencia dice según tu objetivo y peso corporal.',
    actionLabel: 'Descargar',
    kind: 'pdf',
  },
  {
    tag: 'Herramienta',
    title: 'Calculadora de Macros',
    description: 'Calcula tu déficit calórico exacto y los macros que necesitas para perder peso de forma controlada.',
    actionLabel: 'Calcular',
    kind: 'internal',
    href: '/calculadora',
  },
  {
    tag: 'Curso',
    title: 'Curso de Fundamentos',
    description: 'Transforma tu cuerpo en 8 semanas con neurociencia: aprende a crear hábitos que duran, con rutinas, plan de nutrición y app de seguimiento diseñados por nuestro equipo médico.',
    actionLabel: 'Inscribirme',
    kind: 'course',
    href: '/neurociencia',
    coming: true,
  },
];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CalcIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="10" y2="11" />
    <line x1="13" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="10" y2="15" />
    <line x1="13" y1="15" x2="16" y2="15" />
  </svg>
);

const EnrollIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

function ResourceIcon({ kind }: { kind: ResourceKind }) {
  if (kind === 'internal') return <CalcIcon />;
  if (kind === 'course') return <EnrollIcon />;
  return <DownloadIcon />;
}

export default function ResourcesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | undefined>(undefined);
  const [selectedKind, setSelectedKind] = useState<'pdf' | 'course'>('pdf');

  function handleLeadClick(resource: Resource) {
    if (resource.kind !== 'pdf' && resource.kind !== 'course') return;
    setSelectedTitle(resource.title);
    setSelectedKind(resource.kind);
    setModalOpen(true);
    fetch('/api/resource-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'modal_open', resource_title: resource.title, resource_kind: resource.kind, ...getTrackingContext() }),
    }).catch(() => {});
  }

  return (
    <section className="resources" id="recursos">
      <div className="section-inner">
        <span className="eyebrow">Recursos</span>
        <h2>Empieza <span className="accent">aquí</span></h2>
        <p className="lead">Guías prácticas, basadas en evidencia, listas para descargar.</p>

        <div className="resources-grid">
          {resources.map((resource) => {
            const cardClass = `resource-card${resource.coming ? ' resource-card-coming' : ''}`;
            const tagClass = `resource-tag${resource.coming ? ' resource-tag-coming' : ''}`;
            const actionClass = `resource-action${resource.coming ? ' resource-action-waitlist' : ''}${resource.disabled ? ' resource-action-disabled' : ''}`;

            const actionContent = (
              <>
                {resource.actionLabel}
                <ResourceIcon kind={resource.kind} />
              </>
            );

            return (
              <div key={resource.title} className={cardClass}>
                <span className={tagClass}>{resource.tag}</span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>

                {(resource.kind === 'internal' || resource.kind === 'course') && resource.href ? (
                  <a href={resource.href} className={actionClass}>
                    {actionContent}
                  </a>
                ) : (
                  <button
                    type="button"
                    className={actionClass}
                    disabled={resource.disabled}
                    onClick={() => !resource.disabled && handleLeadClick(resource)}
                  >
                    {actionContent}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <EmailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTitle}
        kind={selectedKind}
      />
    </section>
  );
}
