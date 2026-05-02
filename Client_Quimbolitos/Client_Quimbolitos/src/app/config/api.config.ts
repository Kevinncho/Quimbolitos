const LOCAL_API_ORIGIN = 'http://localhost:8080';
const PRODUCTION_API_ORIGIN = 'https://fabulous-delight-production-ced2.up.railway.app';

function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getApiOrigin(): string {
  if (typeof window === 'undefined') {
    return PRODUCTION_API_ORIGIN;
  }

  return isLocalHostname(window.location.hostname)
    ? LOCAL_API_ORIGIN
    : PRODUCTION_API_ORIGIN;
}

export function getApiBaseUrl(): string {
  return `${getApiOrigin()}/api`;
}

export function getAhorcadoWebSocketUrl(token: string): string {
  const apiOrigin = new URL(getApiOrigin());
  const protocol = apiOrigin.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${apiOrigin.host}/ws/ahorcado?token=${encodeURIComponent(token)}`;
}
