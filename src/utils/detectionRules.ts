/**
 * Detection rules for identifying suspicious URL patterns
 * Each rule produces a clear, explainable indicator
 */

import type { ParsedURL, RiskIndicator } from '../types';

// List of well-known brands often targeted in phishing
const TARGET_BRANDS = [
  'google', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix',
  'paypal', 'ebay', 'twitter', 'instagram', 'linkedin', 'yahoo',
  'bank', 'chase', 'wells', 'citi', 'ameritrade', 'robinhood',
  'coinbase', 'binance', 'crypto', 'blockchain', 'wallet'
];

// Suspicious TLDs often used in phishing
const SUSPICIOUS_TLDS = [
  'xyz', 'top', 'club', 'online', 'site', 'tk', 'ml', 'ga',
  'cf', 'cc', 'pw', 'review', 'click', 'download', 'stream'
];

/**
 * Detect lookalike domains using character similarity
 */
export function detectLookalikeDomain(parsed: ParsedURL): RiskIndicator | null {
  const { hostname, domain } = parsed;

  for (const brand of TARGET_BRANDS) {
    // Check if brand name appears in domain
    if (hostname.includes(brand)) {
      // Check if it's NOT the official domain
      const officialDomains = [
        `${brand}.com`,
        `${brand}.org`,
        `${brand}.net`,
        `${brand}.io`,
        `www.${brand}.com`
      ];

      if (!officialDomains.includes(domain) && !officialDomains.includes(hostname)) {
        return {
          id: 'lookalike-domain',
          category: 'lookalike',
          severity: 'high',
          title: 'Potential lookalike domain',
          description: `This domain contains "${brand}" but does not match the official domain structure.`,
          evidence: `Detected in: ${hostname}`
        };
      }
    }
  }

  // Check for character substitutions (e.g., g0ogle.com)
  // Only flag if it contains a digit that looks like a letter in a brand context
  const substitutionPattern = /([a-z]+[0-9]+[a-z]+|[0-9]+[a-z]+[0-9]+)/i;
  if (substitutionPattern.test(hostname)) {
    return {
      id: 'character-substitution',
      category: 'lookalike',
      severity: 'medium',
      title: 'Possible character substitution',
      description: 'The domain may use character substitutions to mimic a legitimate brand.',
      evidence: `Hostname: ${hostname}`
    };
  }

  return null;
}

/**
 * Detect suspicious subdomain patterns
 */
export function detectSuspiciousSubdomains(parsed: ParsedURL): RiskIndicator | null {
  const { subdomains } = parsed;

  if (subdomains.length > 3) {
    return {
      id: 'excessive-subdomains',
      category: 'domain_structure',
      severity: 'medium',
      title: 'Excessive subdomain levels',
      description: 'Legitimate domains rarely use more than 3 subdomain levels.',
      evidence: `Subdomain count: ${subdomains.length}`
    };
  }

  // Check for random-looking subdomains
  const randomPattern = /^[a-z0-9]{20,}$/;
  for (const subdomain of subdomains) {
    if (randomPattern.test(subdomain)) {
      return {
        id: 'random-subdomain',
        category: 'domain_structure',
        severity: 'medium',
        title: 'Random-looking subdomain',
        description: 'This subdomain appears to be randomly generated, which is uncommon for legitimate services.',
        evidence: `Subdomain: ${subdomain}`
      };
    }
  }

  return null;
}

/**
 * Detect suspicious TLD usage
 */
export function detectSuspiciousTLD(parsed: ParsedURL): RiskIndicator | null {
  const tld = parsed.hostname.split('.').pop()?.toLowerCase();

  if (tld && SUSPICIOUS_TLDS.includes(tld)) {
    return {
      id: 'suspicious-tld',
      category: 'domain_structure',
      severity: 'low',
      title: 'Uncommon top-level domain',
      description: `The .${tld} TLD is frequently used in phishing campaigns.`,
      evidence: `TLD: .${tld}`
    };
  }

  return null;
}

/**
 * Detect IP address usage instead of domain names
 */
export function detectIPAddress(parsed: ParsedURL): RiskIndicator | null {
  if (parsed.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
    return {
      id: 'ip-address',
      category: 'domain_structure',
      severity: 'high',
      title: 'IP address instead of domain',
      description: 'Legitimate services use domain names, not raw IP addresses.',
      evidence: `IP: ${parsed.hostname}`
    };
  }

  return null;
}

/**
 * Detect URL encoding abuse
 */
export function detectEncodingAbuse(parsed: ParsedURL): RiskIndicator | null {
  const { normalized } = parsed;

  // Check for excessive percent-encoding
  const percentMatches = normalized.match(/%[0-9A-Fa-f]{2}/g);
  if (percentMatches && percentMatches.length > 5) {
    return {
      id: 'excessive-encoding',
      category: 'encoding',
      severity: 'medium',
      title: 'Excessive URL encoding',
      description: 'Heavy use of URL encoding can hide malicious content.',
      evidence: `Encoded segments: ${percentMatches.length}`
    };
  }

  // Check for encoded brand names
  const encodedBrandPattern = /%(?:67|6F|6F|67|6C|65)/i; // Encoded "google"
  if (encodedBrandPattern.test(normalized)) {
    return {
      id: 'encoded-brand',
      category: 'encoding',
      severity: 'high',
      title: 'Encoded brand name',
      description: 'Brand names are often encoded to evade detection.',
      evidence: 'URL contains encoded characters'
    };
  }

  return null;
}

/**
 * Detect suspicious URL patterns
 */
export function detectSuspiciousPatterns(parsed: ParsedURL): RiskIndicator | null {
  const { path, query } = parsed;

  // Check for excessive query parameters
  const paramCount = query.split('&').filter((p: string) => p).length;
  if (paramCount > 10) {
    return {
      id: 'excessive-params',
      category: 'suspicious_pattern',
      severity: 'low',
      title: 'Excessive query parameters',
      description: 'Unusually many parameters may indicate tracking or manipulation.',
      evidence: `Parameter count: ${paramCount}`
    };
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.scr', '.bat', '.cmd', '.jar', '.pif'];
  for (const ext of suspiciousExtensions) {
    if (path.toLowerCase().includes(ext)) {
      return {
        id: 'executable-extension',
        category: 'suspicious_pattern',
        severity: 'critical',
        title: 'Executable file in URL',
        description: 'This URL points to an executable file, which is highly suspicious.',
        evidence: `Extension: ${ext}`
      };
    }
  }

  return null;
}

/**
 * Run all detection rules on a parsed URL
 */
export function runDetectionRules(parsed: ParsedURL): RiskIndicator[] {
  const indicators: RiskIndicator[] = [];

  const lookalike = detectLookalikeDomain(parsed);
  if (lookalike) indicators.push(lookalike);

  const subdomains = detectSuspiciousSubdomains(parsed);
  if (subdomains) indicators.push(subdomains);

  const tld = detectSuspiciousTLD(parsed);
  if (tld) indicators.push(tld);

  const ip = detectIPAddress(parsed);
  if (ip) indicators.push(ip);

  const encoding = detectEncodingAbuse(parsed);
  if (encoding) indicators.push(encoding);

  const patterns = detectSuspiciousPatterns(parsed);
  if (patterns) indicators.push(patterns);

  return indicators;
}
