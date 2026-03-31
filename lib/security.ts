/**
 * Security hardening module
 * Disables dev tools, right-click, keyboard shortcuts, and console access
 */

export function initSecurityShield() {
  if (import.meta.env.DEV) return; // Skip in development

  // 1. Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Disable common dev tool shortcuts
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I / Cmd+Option+I (Inspector)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C / Cmd+Option+C (Element picker)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    // Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    // Ctrl+S / Cmd+S (Save page)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      return false;
    }
  });

  // 3. Disable text selection on sensitive elements
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    // Allow selection in input/textarea elements
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return true;
    }
    // Allow selection in the humanizer tool output area
    if (target.closest('[data-selectable="true"]')) {
      return true;
    }
  });

  // 4. Disable drag on images
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
    }
  });

  // 5. Clear console and override console methods
  const noop = () => {};
  try {
    console.clear();
    // Replace console methods to prevent info leaks
    const methods: (keyof Console)[] = ['log', 'debug', 'info', 'warn', 'table', 'dir', 'dirxml', 'trace', 'profile', 'profileEnd'];
    methods.forEach((method) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any)[method] = noop;
    });
  } catch {
    // Some environments may not allow this
  }

  // 6. Dev tools detection via debugger timing
  let devToolsDetected = false;
  const detectDevTools = () => {
    const start = performance.now();
    // debugger statement causes a pause if dev tools are open
    // eslint-disable-next-line no-debugger
    debugger;
    const end = performance.now();
    if (end - start > 100 && !devToolsDetected) {
      devToolsDetected = true;
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui;text-align:center;padding:2rem"><div><h1 style="font-size:2rem;margin-bottom:1rem">⚠️ Access Denied</h1><p style="color:#888">Developer tools are not permitted on this site.</p></div></div>';
    }
  };

  // Run detection periodically (every 2 seconds)
  setInterval(detectDevTools, 2000);

  // 7. Prevent iframe embedding (clickjacking protection)
  if (window.top !== window.self) {
    try {
      const parentUrl = window.top?.location?.href || '';
      if (!parentUrl.includes('lovable.app') && !parentUrl.includes('lovable.dev')) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui"><h1>This site cannot be embedded in iframes.</h1></div>';
      }
    } catch {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui"><h1>This site cannot be embedded in iframes.</h1></div>';
    }
  }
}

/**
 * Content Security Policy meta tag injection
 * Restricts what resources the browser can load
 */
export function injectCSPMeta() {
  if (import.meta.env.DEV) return;
  
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.mxpnl.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://*.supabase.co https://ai.gateway.lovable.dev https://api.razorpay.com https://n8n.srv1423196.hstgr.cloud https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://api-eu.mixpanel.com https://*.mxpnl.com`,
    "img-src 'self' data: blob: https:",
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://*.lovable.app https://*.lovable.dev",
  ].join('; ');
  document.head.prepend(meta);
}

/**
 * Inject additional security headers via meta tags
 */
export function injectSecurityMeta() {
  if (import.meta.env.DEV) return;
  
  // X-Content-Type-Options
  const noSniff = document.createElement('meta');
  noSniff.httpEquiv = 'X-Content-Type-Options';
  noSniff.content = 'nosniff';
  document.head.appendChild(noSniff);

  // Referrer Policy - don't leak URLs
  const referrer = document.createElement('meta');
  referrer.name = 'referrer';
  referrer.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrer);

  // Permissions Policy - disable sensitive browser APIs
  // (This must be set as HTTP header for full effect, meta tag is a best-effort)
}
