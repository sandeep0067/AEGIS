import { describe, it, expect } from 'vitest';
import { runDetectionRules, detectLookalikeDomain, detectSuspiciousSubdomains } from '../src/utils/detectionRules';
import { parseURL } from '../src/utils/urlParser';

describe('Detection Rules', () => {
  describe('detectLookalikeDomain', () => {
    it('should detect lookalike domains with brand names', () => {
      const parsed = parseURL('https://google-security.com');
      const result = detectLookalikeDomain(parsed);
      expect(result).not.toBeNull();
      expect(result?.category).toBe('lookalike');
    });

    it('should not flag official domains', () => {
      const parsed = parseURL('https://google.com');
      const result = detectLookalikeDomain(parsed);
      expect(result).toBeNull();
    });

    it('should detect character substitutions', () => {
      const parsed = parseURL('https://g0ogle.com');
      const result = detectLookalikeDomain(parsed);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('character-substitution');
    });
  });

  describe('detectSuspiciousSubdomains', () => {
    it('should detect excessive subdomains', () => {
      const parsed = parseURL('https://a.b.c.d.e.example.com');
      const result = detectSuspiciousSubdomains(parsed);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('excessive-subdomains');
    });

    it('should detect random-looking subdomains', () => {
      const parsed = parseURL('https://x7k9j2m4n5p1q3r6s8t0.example.com');
      const result = detectSuspiciousSubdomains(parsed);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('random-subdomain');
    });

    it('should not flag normal subdomains', () => {
      const parsed = parseURL('https://blog.example.com');
      const result = detectSuspiciousSubdomains(parsed);
      expect(result).toBeNull();
    });
  });

  describe('runDetectionRules', () => {
    it('should return empty array for safe URL', () => {
      const parsed = parseURL('https://example.com');
      const indicators = runDetectionRules(parsed);
      expect(indicators).toEqual([]);
    });

    it('should detect multiple indicators for suspicious URL', () => {
      const parsed = parseURL('https://g0ogle-login.xyz');
      const indicators = runDetectionRules(parsed);
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should detect IP addresses', () => {
      const parsed = parseURL('https://192.168.1.1/login');
      const indicators = runDetectionRules(parsed);
      const ipIndicator = indicators.find(i => i.id === 'ip-address');
      expect(ipIndicator).toBeDefined();
    });

    it('should detect suspicious TLDs', () => {
      const parsed = parseURL('https://example.xyz');
      const indicators = runDetectionRules(parsed);
      const tldIndicator = indicators.find(i => i.id === 'suspicious-tld');
      expect(tldIndicator).toBeDefined();
    });
  });
});
