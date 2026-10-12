'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureUtm, getAllAttribution } from '@/lib/utm';
import { getAnonymousId, getSessionId } from '@/lib/identity';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // The private dashboard is not part of the site's traffic
    if (pathname.startsWith('/data')) return;

    // Capture URL UTMs first (handles direct landings AND mid-session relandings)
    captureUtm();

    const body = JSON.stringify({
      anonymous_id: getAnonymousId(),
      session_id:   getSessionId(),
      path:         pathname,
      referrer:     typeof document !== 'undefined' ? document.referrer : null,
      user_agent:   typeof navigator !== 'undefined' ? navigator.userAgent : null,
      ...getAllAttribution(),
    });

    fetch('/api/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
