/**
 * Global Demo Sandbox Network Guard
 * Intercepts any outgoing mutation requests (POST, PUT, PATCH, DELETE)
 * while in Demo Mode to ensure zero changes can reach a production database.
 */
export function initDemoNetworkGuard(): void {
  if (typeof window === 'undefined') return;

  // Prevent multiple initializations
  if ((window as any).__demoGuardInstalled) return;
  (window as any).__demoGuardInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let isDemo = false;
    try {
      isDemo =
        sessionStorage.getItem('is_demo_mode') === 'true' ||
        new URLSearchParams(window.location.search).get('demo') === 'true' ||
        new URLSearchParams(window.location.search).get('demo') === '1';
    } catch {
      isDemo = false;
    }

    const method = (init?.method || 'GET').toUpperCase();

    if (isDemo && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
      console.warn(
        `[Demo Sandbox Guard] Intercepted and blocked ${method} request to "${urlStr}". All changes remain strictly in sandbox memory.`
      );

      return new Response(
        JSON.stringify({
          success: true,
          mocked: true,
          message: 'Interactive Demo Mode: Action simulated in sandbox memory (Production database was not modified).'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return originalFetch.apply(this, [input, init]);
  };
}
