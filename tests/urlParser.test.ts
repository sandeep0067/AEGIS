import { describe, it, expect } from 'vitest';
import { parseURL, normalizeURL, isValidURL, extractTLD, isIPAddress } from '../src/utils/urlParser';

describe('URL Parser', () => {
  describe('normalizeURL', () => {
    it('should add https:// protocol if missing', () => {
      expect(normalizeURL('example.com')).toBe('https://example.com/');
    });

    it('should preserve existing protocol', () => {
      expect(normalizeURL('https://example.com')).toBe('https://example.com/');
      expect(normalizeURL('http://example.com')).toBe('http://example.com/');
    });

    it('should remove tracking parameters', () => {
      const url = 'https://example.com/path?utm_source=test&utm_medium=email&param=keep';
      const normalized = normalizeURL(url);
      expect(normalized).toContain('param=keep');
      expect(normalized).not.toContain('utm_source');
      expect(normalized).not.toContain('utm_medium');
    });

    it('should trim whitespace', () => {
      expect(normalizeURL('  example.com  ')).toBe('https://example.com/');
    });
  });

  describe('parseURL', () => {
    it('should parse a valid URL correctly', () => {
      const parsed = parseURL('https://sub.example.com/path?query=value#fragment');
      expect(parsed.isValid).toBe(true);
      expect(parsed.hostname).toBe('sub.example.com');
      expect(parsed.domain).toBe('example.com');
      expect(parsed.subdomains).toEqual(['sub']);
      expect(parsed.protocol).toBe('https:');
      expect(parsed.path).toBe('/path');
      expect(parsed.query).toBe('?query=value');
      expect(parsed.fragment).toBe('#fragment');
    });

    it('should handle URLs without subdomains', () => {
      const parsed = parseURL('https://example.com');
      expect(parsed.domain).toBe('example.com');
      expect(parsed.subdomains).toEqual([]);
    });

    it('should handle invalid URLs gracefully', () => {
      const parsed = parseURL('not a url');
      expect(parsed.isValid).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should return true for valid URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('')).toBe(false);
    });
  });

  describe('extractTLD', () => {
    it('should extract TLD correctly', () => {
      expect(extractTLD('example.com')).toBe('com');
      expect(extractTLD('example.co.uk')).toBe('uk');
      expect(extractTLD('sub.example.org')).toBe('org');
    });
  });

  describe('isIPAddress', () => {
    it('should detect IPv4 addresses', () => {
      expect(isIPAddress('192.168.1.1')).toBe(true);
      expect(isIPAddress('10.0.0.1')).toBe(true);
    });

    it('should detect IPv6 addresses', () => {
      expect(isIPAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
    });

    it('should return false for domain names', () => {
      expect(isIPAddress('example.com')).toBe(false);
    });
  });
});
