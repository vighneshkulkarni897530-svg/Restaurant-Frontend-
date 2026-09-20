import { Table } from '../types';

export const CLOUD_PROD_URL = 'https://restaurant-frontend-tau-liart.vercel.app';

export const isPrivateIp = (ip: string): boolean => {
  if (!ip) return false;
  return /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip);
};

/**
 * Sanitizes and normalizes any host URL:
 * - Trims whitespace
 * - Removes trailing slashes
 * - Strips inadvertent dev port (:3000) on cloud domains like vercel.app
 * - Enforces HTTPS for production domains
 */
export const sanitizeHostUrl = (url: string): string => {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');

  // If running on Vercel or any cloud domain, strip invalid :3000
  if (clean.includes('vercel.app') || (clean.startsWith('https://') && clean.includes(':3000'))) {
    clean = clean.replace(':3000', '');
    if (clean.startsWith('http://')) {
      clean = clean.replace('http://', 'https://');
    }
  }

  // Ensure protocol
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (isPrivateIp(clean) || clean.includes('localhost') || clean.startsWith('127.0.0.1')) {
      clean = `http://${clean}`;
    } else {
      clean = `https://${clean}`;
    }
  }

  return clean;
};

/**
 * Resolves the appropriate application base URL for generating customer QR codes.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL environment variable
 * 2. NEXT_PUBLIC_CUSTOMER_URL environment variable
 * 3. window.location.origin (if accessed from a live, non-localhost domain)
 * 4. Fallback production URL (CLOUD_PROD_URL) to guarantee phone camera scannability
 */
export const getAppBaseUrl = (allowLocalhostForDev = false): string => {
  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envAppUrl && envAppUrl.trim()) {
    return sanitizeHostUrl(envAppUrl);
  }

  const envCustomerUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL;
  if (envCustomerUrl && envCustomerUrl.trim() && !envCustomerUrl.includes('smoky.vercel.app') && !envCustomerUrl.includes('r1sqderz8')) {
    return sanitizeHostUrl(envCustomerUrl);
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0';

    if (!isLocalhost && origin) {
      return sanitizeHostUrl(origin);
    }

    if (allowLocalhostForDev && isLocalhost) {
      return sanitizeHostUrl(origin);
    }
  }

  return CLOUD_PROD_URL;
};

/**
 * Generates a validated, robust table QR URL for customers.
 * Format: ${baseUrl}/t/${tableIdentifier}
 * 
 * Ensures no undefined, null, or malformed URLs are generated.
 */
export const buildTableQRUrl = (
  table: Table | null | undefined,
  customBaseUrl?: string
): string => {
  if (!table) return '';

  const tableIdentifier = table.qrToken || table.tableNumber || table.id;
  if (!tableIdentifier || tableIdentifier === 'undefined' || tableIdentifier === 'null') {
    return '';
  }

  const baseUrl = customBaseUrl ? sanitizeHostUrl(customBaseUrl) : getAppBaseUrl();
  return `${baseUrl}/t/${encodeURIComponent(tableIdentifier)}`;
};

/**
 * Legacy compatible menu URL builder
 * Format: ${baseUrl}/menu?table=${tableToken}
 */
export const buildLegacyMenuQRUrl = (
  table: Table | null | undefined,
  customBaseUrl?: string
): string => {
  if (!table) return '';

  const token = table.qrToken || table.tableNumber || table.id;
  if (!token || token === 'undefined' || token === 'null') {
    return '';
  }

  const baseUrl = customBaseUrl ? sanitizeHostUrl(customBaseUrl) : getAppBaseUrl();
  return `${baseUrl}/menu?table=${encodeURIComponent(token)}`;
};
