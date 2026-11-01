/**
 * Risk scoring engine
 * Converts detection indicators into explainable risk categories
 */

import type { RiskIndicator, URLAnalysis } from '../types';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Calculate risk level based on indicators
 */
export function calculateRiskLevel(indicators: RiskIndicator[]): RiskLevel {
  if (indicators.length === 0) {
    return 'safe';
  }

  // Check for critical severity
  const hasCritical = indicators.some(i => i.severity === 'critical');
  if (hasCritical) return 'critical';

  // Check for high severity
  const hasHigh = indicators.some(i => i.severity === 'high');
  if (hasHigh) return 'high';

  // Count medium and low severity indicators
  const mediumCount = indicators.filter(i => i.severity === 'medium').length;
  const lowCount = indicators.filter(i => i.severity === 'low').length;

  if (mediumCount >= 2) return 'high';
  if (mediumCount >= 1) return 'medium';
  if (lowCount >= 3) return 'medium';
  if (lowCount >= 1) return 'low';

  return 'low';
}

/**
 * Get human-readable explanation for risk level
 */
export function getRiskExplanation(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'No suspicious indicators detected. Note: This does not guarantee the URL is safe.';
    case 'low':
      return 'Minor suspicious patterns detected. Proceed with caution.';
    case 'medium':
      return 'Multiple suspicious indicators detected. Exercise caution before visiting.';
    case 'high':
      return 'Strong signs of suspicious activity. Avoid visiting this URL.';
    case 'critical':
      return 'Critical security risks detected. Do not visit this URL.';
    default:
      return 'Unable to determine risk level.';
  }
}

/**
 * Get recommended action based on risk level
 */
export function getRecommendedAction(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'You may proceed, but always verify the source of the link.';
    case 'low':
      return 'Verify the URL source and hover over the link to check the destination.';
    case 'medium':
      return 'Do not click. Verify the URL through an official channel.';
    case 'high':
      return 'Do not visit. Report this URL if possible.';
    case 'critical':
      return 'Block this URL immediately and report it.';
    default:
      return 'Exercise caution.';
  }
}

/**
 * Create a URL analysis result
 */
export function createAnalysis(
  url: string,
  normalizedUrl: string,
  hostname: string,
  indicators: RiskIndicator[],
  reputation?: any
): URLAnalysis {
  const riskLevel = calculateRiskLevel(indicators);

  return {
    url,
    normalizedUrl,
    hostname,
    riskLevel,
    indicators,
    reputation,
    timestamp: Date.now()
  };
}
