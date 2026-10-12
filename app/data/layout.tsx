import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel · Entrena con Ciencia',
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="panel-ecc min-h-screen bg-[#f4f7f9] text-[#0b1b26] font-normal">{children}</div>;
}
