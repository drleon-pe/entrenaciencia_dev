'use client';

import { Analytics } from '@vercel/analytics/next';

// Vercel Web Analytics, without the private dashboard (/data).
export default function VercelAnalytics() {
  return <Analytics beforeSend={(event) => (new URL(event.url).pathname.startsWith('/data') ? null : event)} />;
}
