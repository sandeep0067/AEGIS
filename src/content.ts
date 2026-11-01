/**
 * Content script for AEGIS
 * Injects warning overlay on suspicious sites
 */

console.log('AEGIS content script loaded on:', window.location.href);

// Test function - create a test overlay
function createTestOverlay() {
  console.log('Creating TEST overlay');
  const testAnalysis = {
    url: window.location.href,
    riskLevel: 'high',
    indicators: [
      {
        title: 'Test Indicator',
        description: 'This is a test to verify the overlay works',
        evidence: 'Test evidence',
        severity: 'high'
      }
    ]
  };
  createWarningOverlay(testAnalysis);
}

// Create warning overlay element
function createWarningOverlay(analysis: any) {
  console.log('Creating warning overlay for:', analysis.url, 'Risk:', analysis.riskLevel);

  // Remove existing overlay if present
  const existing = document.getElementById('aegis-warning-overlay');
  if (existing) {
    console.log('Removing existing overlay');
    existing.remove();
  }

  // Wait for body to be ready
  if (!document.body) {
    console.log('Body not ready, waiting...');
    setTimeout(() => createWarningOverlay(analysis), 100);
    return;
  }

  console.log('Body is ready, creating overlay');

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'aegis-warning-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.7) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;

  // Create warning box - uBlock Origin style
  const warningBox = document.createElement('div');
  warningBox.style.cssText = `
    background: #1e282d !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    max-width: 400px !important;
    width: 90% !important;
    padding: 20px !important;
    border: 1px solid #374151 !important;
  `;

  // Build HTML content - uBlock Origin style
  const riskColor = analysis.riskLevel === 'critical' ? '#ef4444' : '#f97316';
  const riskBg = analysis.riskLevel === 'critical' ? '#dc2626' : '#ef4444';
  const riskText = analysis.riskLevel.toUpperCase();

  let indicatorsHtml = '';
  for (const ind of analysis.indicators) {
    const severityColors = {
      critical: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', dot: '#ef4444' },
      high: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', dot: '#ef4444' },
      medium: { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)', text: '#fdba74', dot: '#f97316' },
      low: { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.2)', text: '#fde047', dot: '#eab308' }
    };
    const colors = severityColors[ind.severity as keyof typeof severityColors] || severityColors.low;
    indicatorsHtml += `
      <div style="background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span style="display: inline-block; width: 6px; height: 6px; background: ${colors.dot}; border-radius: 50%; margin-right: 8px;"></span>
          <span style="font-size: 13px; font-medium text-white;">${ind.title}</span>
        </div>
        <div style="font-size: 12px; color: #9ca3af; line-height: 1.4; margin-bottom: 4px;">${ind.description}</div>
        <div style="font-size: 11px; font-family: ui-monospace, monospace; color: #6b7280; background: #1f2937; padding: 4px 8px; border-radius: 4px;">${ind.evidence}</div>
      </div>
    `;
  }

  warningBox.innerHTML = `
    <div style="display: flex; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #374151;">
      <div style="width: 40px; height: 40px; background: ${riskBg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
        <svg style="width: 24px; height: 24px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h2 style="margin: 0 0 4px 0; font-size: 16px; font-semibold text-white;">Security Warning</h2>
        <span style="display: inline-block; background: ${riskBg}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-semibold text-transform: uppercase;">${riskText} Risk</span>
      </div>
    </div>

    <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); border-radius: 6px; padding: 10px; margin-bottom: 12px; word-break: break-all;">
      <p style="margin: 0; font-size: 12px; font-family: ui-monospace, monospace; color: #fde047;">${analysis.url}</p>
    </div>

    <p style="margin: 0 0 12px 0; font-size: 13px; color: #e5e7eb; line-height: 1.5;">
      This website has been flagged as potentially suspicious with <strong style="color: ${riskColor};">${analysis.indicators.length} suspicious indicator${analysis.indicators.length !== 1 ? 's' : ''}</strong>.
    </p>

    <div style="margin-bottom: 16px; max-height: 160px; overflow-y: auto;">
      ${indicatorsHtml}
    </div>

    <div style="display: flex; gap: 8px;">
      <button id="aegis-proceed-btn" style="background: #00bcd4; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-medium; cursor: pointer; flex: 1;">
        I understand, proceed
      </button>
      <button id="aegis-back-btn" style="background: #1f2937; color: white; border: 1px solid #374151; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-medium; cursor: pointer; flex: 1;">
        Go back
      </button>
    </div>

    <div style="margin-top: 12px; text-align: center; font-size: 11px; color: #6b7280;">
      AEGIS Browser Security Assistant
    </div>
  `;

  overlay.appendChild(warningBox);
  document.body.appendChild(overlay);

  console.log('Overlay added to DOM successfully');

  // Add event listeners
  const proceedBtn = document.getElementById('aegis-proceed-btn');
  const backBtn = document.getElementById('aegis-back-btn');

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      overlay.remove();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      overlay.remove();
      window.history.back();
    });
  }

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request: any, _sender: any, _sendResponse: any) => {
  console.log('Content script received message:', request.action);
  if (request.action === 'showWarning') {
    createWarningOverlay(request.analysis);
  } else if (request.action === 'testOverlay') {
    createTestOverlay();
  }
  return true;
});

// Expose test function to window for manual testing
(window as any).testAEGISOverlay = createTestOverlay;
console.log('AEGIS test function available: window.testAEGISOverlay()');
