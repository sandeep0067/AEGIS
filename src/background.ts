/**
 * Background service worker for AEGIS extension
 * Monitors tabs and automatically analyzes URLs
 */

import { parseURL } from './utils/urlParser';
import { runDetectionRules } from './utils/detectionRules';
import { calculateRiskLevel } from './utils/scoring';

// Store analysis results for each tab
const tabAnalysis = new Map<number, any>();
// Track tabs that have already shown warnings
const warnedTabs = new Set<number>();

/**
 * Analyze a URL and return the result
 */
async function analyzeURL(url: string) {
  try {
    const parsed = parseURL(url);
    if (!parsed.isValid) {
      return { riskLevel: 'safe', indicators: [] };
    }

    const indicators = runDetectionRules(parsed);
    const riskLevel = calculateRiskLevel(indicators);

    return {
      url,
      normalizedUrl: parsed.normalized,
      hostname: parsed.hostname,
      riskLevel,
      indicators,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return { riskLevel: 'safe', indicators: [] };
  }
}

/**
 * Update the extension badge based on risk level
 */
function updateBadge(tabId: number, riskLevel: string) {
  const badgeConfig = {
    safe: { text: '', color: '#22c55e', path: 'icons/icon-secure-32.png' },
    low: { text: '!', color: '#eab308', path: 'icons/icon-32.png' },
    medium: { text: '⚠', color: '#f97316', path: 'icons/icon-32.png' },
    high: { text: '⚠', color: '#ef4444', path: 'icons/icon-warning-32.png' },
    critical: { text: '✕', color: '#dc2626', path: 'icons/icon-warning-32.png' }
  };

  const config = badgeConfig[riskLevel as keyof typeof badgeConfig] || badgeConfig.safe;

  // Set badge text and color
  chrome.action.setBadgeText({ text: config.text, tabId });
  chrome.action.setBadgeBackgroundColor({ color: config.color, tabId });
  chrome.action.setIcon({ path: config.path, tabId });
}

/**
 * Show warning for suspicious sites
 */
function showWarning(tabId: number, analysis: any) {
  console.log('showWarning called for tab', tabId, 'risk level:', analysis.riskLevel);

  // Only show warning for high or critical risk
  if (analysis.riskLevel !== 'high' && analysis.riskLevel !== 'critical') {
    console.log('Skipping warning - risk level is', analysis.riskLevel);
    return;
  }

  // Don't show warning if already shown for this tab
  if (warnedTabs.has(tabId)) {
    console.log('Skipping warning - already warned for tab', tabId);
    return;
  }

  warnedTabs.add(tabId);
  console.log('Sending showWarning message to tab', tabId);

  // Delay slightly to ensure content script is loaded
  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, {
      action: 'showWarning',
      analysis: analysis
    }, (_response: any) => {
      // Content script might not be loaded yet, that's okay
      if (chrome.runtime.lastError) {
        console.log('Content script not ready:', chrome.runtime.lastError.message);
      } else {
        console.log('Message sent successfully to content script');
      }
    });
  }, 500);
}

/**
 * Analyze the current tab
 */
async function analyzeTab(tabId: number, url: string) {
  // Skip chrome:// and other internal pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setIcon({ path: 'icons/icon.svg', tabId });
    return;
  }

  const analysis = await analyzeURL(url);
  tabAnalysis.set(tabId, analysis);
  updateBadge(tabId, analysis.riskLevel);

  // Show warning for suspicious sites
  if (analysis.riskLevel === 'high' || analysis.riskLevel === 'critical') {
    showWarning(tabId, analysis);
  }

  // Save to history
  if (analysis.indicators.length > 0) {
    chrome.storage.local.get(['scanHistory'], (result: { scanHistory?: any[] }) => {
      const history = result.scanHistory || [];
      const newEntry = {
        url: url,
        riskLevel: analysis.riskLevel,
        timestamp: analysis.timestamp,
        indicators: analysis.indicators.length
      };
      const updatedHistory = [newEntry, ...history].slice(0, 50);
      chrome.storage.local.set({ scanHistory: updatedHistory });
    });
  }
}

/**
 * Handle tab updates
 */
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: any, tab: any) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Reset warning flag for new navigation
    warnedTabs.delete(tabId);
    analyzeTab(tabId, tab.url);
  }
});

/**
 * Handle tab activation
 */
chrome.tabs.onActivated.addListener((activeInfo: any) => {
  chrome.tabs.get(activeInfo.tabId, (tab: any) => {
    if (tab.url) {
      analyzeTab(activeInfo.tabId, tab.url);
    }
  });
});

/**
 * Handle tab removal
 */
chrome.tabs.onRemoved.addListener((tabId: number) => {
  tabAnalysis.delete(tabId);
  warnedTabs.delete(tabId);
});

/**
 * Extension installed
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('AEGIS extension installed');

  // Analyze all existing tabs
  chrome.tabs.query({}, (tabs: any[]) => {
    tabs.forEach((tab: any) => {
      if (tab.id && tab.url) {
        analyzeTab(tab.id, tab.url);
      }
    });
  });
});

/**
 * Handle messages from popup
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getTabAnalysis') {
    const tabId = request.tabId;
    const analysis = tabAnalysis.get(tabId);
    sendResponse(analysis);
  } else if (request.action === 'scanTab') {
    const tabId = request.tabId;
    const url = request.url;
    if (typeof tabId === 'number' && typeof url === 'string') {
      analyzeTab(tabId, url).then(() => sendResponse(tabAnalysis.get(tabId)));
    } else {
      sendResponse(undefined);
    }
  } else if (request.action === 'openPopup') {
    chrome.action.openPopup();
  } else if (request.action === 'testOverlay') {
    // Forward test request to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'testOverlay' });
      }
    });
  }
  return true;
});
