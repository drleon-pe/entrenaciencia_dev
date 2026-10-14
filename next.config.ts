import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy browser packages out of the webpack bundle — loaded at runtime
  // by the Node.js API routes that need them.
  serverExternalPackages: ['playwright', 'puppeteer-core', '@sparticuz/chromium'],

  // Landing del curso (sitio estático en public/neurociencia/, copiado con scripts/sync-vsl.sh).
  // /neurociencia sirve su index.html, que manda a la versión de celular o escritorio.
  async rewrites() {
    return [{ source: '/neurociencia', destination: '/neurociencia/index.html' }];
  },
  // La dirección anterior /vsl sigue funcionando: redirige a /neurociencia (anuncios y links ya compartidos).
  async redirects() {
    return [
      { source: '/vsl', destination: '/neurociencia', permanent: true },
      { source: '/vsl/:path*', destination: '/neurociencia/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
