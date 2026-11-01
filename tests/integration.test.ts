import { describe, it, expect } from 'vitest';
import { parseURL } from '../src/utils/urlParser';
import { runDetectionRules } from '../src/utils/detectionRules';
import { calculateRiskLevel } from '../src/utils/scoring';

describe('Integration Tests', () => {
  describe('Benign URLs', () => {
    it('should analyze safe URL without indicators', () => {
      const url = 'https://example.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators).toHaveLength(0);
      expect(riskLevel).toBe('safe');
    });

    it('should handle legitimate Google URL', () => {
      const url = 'https://google.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(riskLevel).toBe('safe');
    });

    it('should handle legitimate subdomain', () => {
      const url = 'https://blog.example.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(riskLevel).toBe('safe');
    });
  });

  describe('Suspicious URLs', () => {
    it('should detect lookalike domain', () => {
      const url = 'https://google-security.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
      expect(riskLevel).not.toBe('safe');
    });

    it('should detect character substitution', () => {
      const url = 'https://g0ogle-login.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
      expect(riskLevel).not.toBe('safe');
    });

    it('should detect IP address', () => {
      const url = 'https://192.168.1.1/login';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
      expect(riskLevel).not.toBe('safe');
    });

    it('should detect suspicious TLD', () => {
      const url = 'https://example.xyz';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should detect excessive subdomains', () => {
      const url = 'https://a.b.c.d.e.example.com';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should detect executable file in URL', () => {
      const url = 'https://example.com/download/file.exe';
      const parsed = parseURL(url);
      const indicators = runDetectionRules(parsed);
      const riskLevel = calculateRiskLevel(indicators);

      expect(parsed.isValid).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);
      expect(riskLevel).toBe('critical');
    });
  });

  describe('Edge Cases', () => {
    it('should handle URL without protocol', () => {
      const url = 'example.com';
      const parsed = parseURL(url);

      expect(parsed.isValid).toBe(true);
      expect(parsed.protocol).toBe('https:');
    });

    it('should handle invalid URL gracefully', () => {
      const url = 'not a valid url';
      const parsed = parseURL(url);

      expect(parsed.isValid).toBe(false);
    });

    it('should handle URL with tracking parameters', () => {
      const url = 'https://example.com?utm_source=test&utm_medium=email';
      const parsed = parseURL(url);

      expect(parsed.isValid).toBe(true);
      expect(parsed.query).not.toContain('utm_source');
    });
  });
});
