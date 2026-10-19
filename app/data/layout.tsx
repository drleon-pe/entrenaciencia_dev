import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel · Entrena con Ciencia',
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <div className="panel-ecc overflow-x-clip min-h-screen bg-[#F5FAFC] text-[#0B1F2C] font-normal">{children}</div>;
}
