/**
 * Safely parse and normalize URLs for analysis
 * Uses the URL API for robust parsing with fallback handling
 */

export interface ParsedURL {
  original: string;
  normalized: string;
  hostname: string;
  domain: string;
  subdomains: string[];
  protocol: string;
  path: string;
  query: string;
  fragment: string;
  isValid: boolean;
}

/**
 * Normalize a URL by removing tracking parameters and decoding encoded characters
 */
export function normalizeURL(url: string): string {
  try {
    // Remove leading/trailing whitespace
    url = url.trim();

    // Add protocol if missing
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    const parsed = new URL(url);

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', '_ga', '_gid'
    ];

    trackingParams.forEach(param => {
      parsed.searchParams.delete(param);
    });

    // Return normalized URL
    return parsed.toString();
  } catch (error) {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Parse a URL into its components for analysis
 */
export function parseURL(url: string): ParsedURL {
  const normalized = normalizeURL(url);

  try {
    const parsed = new URL(normalized);

    // Extract domain (e.g., example.com from sub.example.com)
    const hostname = parsed.hostname.toLowerCase();
    const parts = hostname.split('.');
    const domain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const subdomains = parts.length > 2 ? parts.slice(0, -2) : [];

    return {
      original: url,
      normalized,
      hostname,
      domain,
      subdomains,
      protocol: parsed.protocol,
      path: parsed.pathname,
      query: parsed.search,
      fragment: parsed.hash,
      isValid: true
    };
  } catch (error) {
    return {
      original: url,
      normalized,
      hostname: '',
      domain: '',
      subdomains: [],
      protocol: '',
      path: '',
      query: '',
      fragment: '',
      isValid: false
    };
  }
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    const normalized = normalizeURL(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract the TLD (top-level domain) from a hostname
 */
export function extractTLD(hostname: string): string {
  const parts = hostname.split('.');
  return parts.length >= 1 ? parts[parts.length - 1] : '';
}

/**
 * Check if hostname uses an IP address instead of a domain
 */
export function isIPAddress(hostname: string): boolean {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
}
