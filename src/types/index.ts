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

export interface URLAnalysis {
  url: string;
  normalizedUrl: string;
  hostname: string;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  indicators: RiskIndicator[];
  reputation?: ReputationResult;
  timestamp: number;
}

export interface RiskIndicator {
  id: string;
  category: 'lookalike' | 'suspicious_pattern' | 'encoding' | 'domain_structure' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string;
}

export interface ReputationResult {
  source: string;
  isMalicious: boolean;
  confidence?: number;
  lastChecked?: string;
}

export interface ScanHistory {
  url: string;
  riskLevel: string;
  timestamp: number;
  indicators: number;
}
