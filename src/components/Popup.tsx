import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  RotateCw,
  Copy,
  Check,
  Globe,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import type { URLAnalysis, RiskIndicator } from '../types';
import { parseURL } from '../utils/urlParser';
import { runDetectionRules } from '../utils/detectionRules';
import { calculateRiskLevel } from '../utils/scoring';
import { History } from './History';

const analyzeLocally = (url: string): URLAnalysis => {
  const parsed = parseURL(url);
  const indicators = parsed.isValid ? runDetectionRules(parsed) : [];
  return {
    url,
    normalizedUrl: parsed.normalized,
    hostname: parsed.hostname || 'Unknown site',
    riskLevel: calculateRiskLevel(indicators),
    indicators,
    timestamp: Date.now(),
  };
};

export const Popup: React.FC = () => {
  const [analysis, setAnalysis] = useState<URLAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUrl, setActiveUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const getActiveTab = (cb: (tab: any | undefined) => void) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      cb(undefined);
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => cb(tabs[0]));
  };

  const loadAnalysis = () => {
    setIsLoading(true);
    getActiveTab((tab) => {
      if (!tab?.id || !tab.url) {
        if (import.meta.env.DEV) {
          const url = window.location.href;
          setActiveUrl(url);
          setAnalysis(analyzeLocally(url));
        }
        setIsLoading(false);
        return;
      }
      setActiveUrl(tab.url);
      chrome.runtime.sendMessage({ action: 'getTabAnalysis', tabId: tab.id }, (response: URLAnalysis | undefined) => {
        if (response) {
          setAnalysis(response);
        } else {
          setAnalysis(analyzeLocally(tab.url));
        }
        setIsLoading(false);
      });
    });
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const handleRescan = () => {
    getActiveTab((tab) => {
      if (!tab?.id || !tab.url) {
        if (import.meta.env.DEV) setAnalysis(analyzeLocally(activeUrl || window.location.href));
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setActiveUrl(tab.url);
      chrome.runtime.sendMessage({ action: 'scanTab', tabId: tab.id, url: tab.url }, (response: URLAnalysis | undefined) => {
        if (response) {
          setAnalysis(response);
        } else {
          setAnalysis(analyzeLocally(tab.url));
        }
        setIsLoading(false);
      });
    });
  };

  const handleCopyCleanUrl = () => {
    const target = analysis?.normalizedUrl || activeUrl;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove(['scanHistory']);
    }
  };

  const parsed = parseURL(activeUrl || 'https://example.com');
  const isHttps = parsed.protocol === 'https:';
  const unsupported = /^(chrome|chrome-extension|edge|about|devtools):/i.test(activeUrl);

  const riskLevel = analysis?.riskLevel || 'safe';
  const isSafe = riskLevel === 'safe';
  const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';

  // Real rule evaluation checks
  const lookalikeIndicator = analysis?.indicators.find((i: RiskIndicator) => i.category === 'lookalike');
  const structureIndicator = analysis?.indicators.find((i: RiskIndicator) => i.id === 'suspicious-tld' || i.id === 'excessive-subdomains' || i.id === 'random-subdomain');
  const hostIndicator = analysis?.indicators.find((i: RiskIndicator) => i.id === 'ip-address');
  const payloadIndicator = analysis?.indicators.find((i: RiskIndicator) => i.category === 'encoding' || i.category === 'suspicious_pattern');

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.domain || parsed.hostname}&sz=32`;

  return (
    <div className="w-[360px] bg-[#121316] text-[#e1e4ea] font-sans antialiased select-none flex flex-col p-4 gap-3.5 min-h-[460px]">
      {/* ── Native Window Header ── */}
      <header className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-300" />
          <span className="font-semibold text-xs tracking-tight text-white">Aegis Security</span>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`p-1.5 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer ${
            showHistory ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/60'
          }`}
          title="Recent Scans"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* ── View: History Modal or Main Security Report ── */}
      {showHistory ? (
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-white">Recent Scans</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <History onClearHistory={clearHistory} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          {/* ── Active Site Domain Banner (Apple HIG style) ── */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-zinc-900/90 border border-white/[0.08]">
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
              {!faviconError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  className="w-4 h-4 rounded-sm"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Globe className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white truncate block" title={parsed.hostname}>
                {parsed.hostname || 'Active website'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                <span className={`inline-flex items-center gap-1 font-medium ${isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isHttps ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                  {isHttps ? 'Encrypted' : 'Not secure'}
                </span>
                <span>·</span>
                <span className="truncate">{parsed.domain || 'Local target'}</span>
              </div>
            </div>
          </div>

          {/* ── Security Verdict Hero Card ── */}
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
            isSafe
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : isHighRisk
              ? 'bg-rose-950/20 border-rose-500/30'
              : 'bg-amber-950/20 border-amber-500/30'
          }`}>
            <div className="mt-0.5 shrink-0">
              {isSafe ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-white">
                {isLoading ? 'Checking site…' : isSafe ? 'No security threats detected' : isHighRisk ? 'Potential phishing risk' : 'Suspicious patterns detected'}
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                {isLoading
                  ? 'Analyzing URL structure, domain records, and parameters.'
                  : isSafe
                  ? 'This site matches expected domain conventions with no deceptive indicators.'
                  : `${analysis?.indicators.length} indicator(s) flagged on this address. Verify before entering data.`}
              </p>
            </div>
          </div>

          {/* ── Apple HIG Inset Grouped Checklist ── */}
          <div className="rounded-lg bg-zinc-900/60 border border-white/[0.08] divide-y divide-white/[0.06] text-xs">
            {/* Row 1: Brand Spoofing Check */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white">Brand Name Authenticity</span>
                <span className="text-[10px] text-zinc-400">
                  {lookalikeIndicator ? lookalikeIndicator.description : 'Matches official registered domain'}
                </span>
              </div>
              <span className={`text-[10px] font-medium ${lookalikeIndicator ? 'text-rose-400' : 'text-emerald-400'}`}>
                {lookalikeIndicator ? 'Flagged' : 'Verified'}
              </span>
            </div>

            {/* Row 2: Domain Structure & TLD */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white">Domain & Extension</span>
                <span className="text-[10px] text-zinc-400">
                  {structureIndicator ? structureIndicator.description : `Standard top-level domain (${parsed.hostname.split('.').pop() || 'tld'})`}
                </span>
              </div>
              <span className={`text-[10px] font-medium ${structureIndicator ? 'text-amber-400' : 'text-emerald-400'}`}>
                {structureIndicator ? 'Uncommon' : 'Standard'}
              </span>
            </div>

            {/* Row 3: Host Identity */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white">Host Destination</span>
                <span className="text-[10px] text-zinc-400">
                  {hostIndicator ? 'Raw IP address used instead of domain' : 'Canonical DNS domain name'}
                </span>
              </div>
              <span className={`text-[10px] font-medium ${hostIndicator ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hostIndicator ? 'Raw IP' : 'Domain'}
              </span>
            </div>

            {/* Row 4: Payload & URL Parameters */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white">URL Parameters & Scripts</span>
                <span className="text-[10px] text-zinc-400">
                  {payloadIndicator ? payloadIndicator.description : 'Standard query format, no executables'}
                </span>
              </div>
              <span className={`text-[10px] font-medium ${payloadIndicator ? 'text-amber-400' : 'text-emerald-400'}`}>
                {payloadIndicator ? 'Flagged' : 'Clean'}
              </span>
            </div>
          </div>

          {/* ── Threat Details Box (If Any Indicators Triggered) ── */}
          {analysis && analysis.indicators.length > 0 && (
            <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Detection Details</span>
              </span>
              {analysis.indicators.map((ind: RiskIndicator, i: number) => (
                <div key={i} className="text-[10px] text-zinc-300">
                  <span className="font-semibold text-white">{ind.title}:</span> {ind.description}
                  <div className="font-mono text-zinc-400 text-[9px] mt-0.5 bg-black/40 px-1 py-0.5 rounded truncate">
                    {ind.evidence}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="mt-auto pt-2 flex items-center gap-2">
            <button
              onClick={handleRescan}
              disabled={isLoading || unsupported}
              className="flex-1 h-8 rounded-md bg-zinc-200 hover:bg-white text-zinc-900 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Checking…' : 'Re-check site'}</span>
            </button>

            <button
              onClick={handleCopyCleanUrl}
              className="h-8 px-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] active:scale-[0.99] transition-all flex items-center justify-center gap-1 text-xs font-medium cursor-pointer"
              title="Copy sanitized URL (removes tracking tags)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy Clean'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Discreet System Footer ── */}
      <footer className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
        <span>Evaluated locally in browser</span>
        <span>Zero data collected</span>
      </footer>
    </div>
  );
};
