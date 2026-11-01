# AEGIS Demo Guide

## Quick Start

1. Build the extension: `npm run build`
2. Load in Chrome: `chrome://extensions/` → "Load unpacked" → select `dist/` folder
3. Click the AEGIS icon in your toolbar
4. Enter a URL and click "Analyze"

## Demo Scenarios

### Scenario 1: Safe URL
**Input**: `https://example.com`

**Expected Result**:
- Risk Level: Safe (green badge)
- Explanation: "No suspicious indicators detected. Note: This does not guarantee the URL is safe."
- Indicators: None
- Recommended Action: "You may proceed, but always verify the source of the link."

### Scenario 2: Lookalike Domain
**Input**: `https://google-security.com`

**Expected Result**:
- Risk Level: High (red badge)
- Explanation: "Strong signs of suspicious activity. Avoid visiting this URL."
- Indicators:
  - "Potential lookalike domain" - severity: high
  - Evidence: "Detected in: google-security.com"
- Recommended Action: "Do not visit. Report this URL if possible."

### Scenario 3: IP Address
**Input**: `https://192.168.1.1/login`

**Expected Result**:
- Risk Level: High (red badge)
- Indicators:
  - "IP address instead of domain" - severity: high
  - Evidence: "IP: 192.168.1.1"

### Scenario 4: Executable File
**Input**: `https://example.com/download/file.exe`

**Expected Result**:
- Risk Level: Critical (dark red badge)
- Explanation: "Critical security risks detected. Do not visit this URL."
- Indicators:
  - "Executable file in URL" - severity: critical
  - Evidence: "Extension: .exe"
- Recommended Action: "Block this URL immediately and report it."

### Scenario 5: Suspicious TLD
**Input**: `https://example.xyz`

**Expected Result**:
- Risk Level: Low (yellow badge)
- Indicators:
  - "Uncommon top-level domain" - severity: low
  - Evidence: "TLD: .xyz"

## Testing Scan History

1. Analyze several URLs (mix of safe and suspicious)
2. Scroll to the "Scan History" section at the bottom
3. You should see:
   - Previously scanned URLs
   - Risk level badges
   - Timestamps
   - Indicator counts
4. Click "Clear History" to remove all entries

## Key Features to Demonstrate

1. **Explainable Results**: Every indicator has a clear title, description, and evidence
2. **Risk Categories**: Distinct colors for safe (green), low (yellow), medium (orange), high (red), critical (dark red)
3. **Local Analysis**: No network requests to external servers
4. **Privacy**: Only uses `storage` permission, saves history locally
5. **Transparent**: Never claims a URL is definitively safe

## Talking Points for LinkedIn/Portfolio

### Technical Highlights

1. **Local-First Architecture**: All URL analysis happens in the browser using TypeScript rules, no external API calls required
2. **Explainable AI Approach**: Instead of a black-box ML model, every detection rule produces human-readable explanations with evidence
3. **Minimal Permissions**: Only requests `storage` permission, respecting user privacy
4. **Type-Safe Development**: Full TypeScript implementation with comprehensive unit tests (35 tests, all passing)
5. **Modern Stack**: React 19, Vite 8, Tailwind CSS 4, Chrome Extension Manifest V3

### Design Philosophy

1. **Transparency Over Certainty**: Reports individual risk indicators rather than making unsupported claims about maliciousness
2. **Privacy by Design**: No data leaves the user's browser, no analytics or tracking
3. **User Education**: Explains *why* a URL might be suspicious, not just *that* it is
4. **Defensive Security**: Helps users make informed decisions rather than blocking navigation

### Lessons Learned

1. **Chrome Extension Constraints**: Background service workers in Manifest V3 have specific limitations (e.g., no DOM access)
2. **URL Parsing Edge Cases**: Handling malformed URLs, encoding, and protocol detection requires careful implementation
3. **False Positive Management**: Legitimate URLs (e.g., shorteners, new TLDs) can trigger indicators - need clear communication
4. **Build Configuration**: Vite + Chrome Extension requires custom config for multiple entry points and asset handling

## Future Improvements (Not in MVP)

1. **Threat Intelligence Integration**: Google Safe Browsing API or VirusTotal for reputation checks
2. **Context Menu**: Right-click to analyze links without opening popup
3. **Real-time Scanning**: Analyze links on pages as user browses
4. **Machine Learning**: Improve detection with trained models
5. **Custom Rules**: Allow users to add custom detection patterns
6. **Export History**: Export scan history to CSV for analysis

## Screenshots/Recording Tips

When creating demo materials:

1. **Show the popup UI**: Clean, professional interface with clear risk indicators
2. **Demonstrate multiple scenarios**: Safe URL, lookalike domain, IP address, executable
3. **Show the history feature**: Demonstrate clearing history
4. **Highlight explainability**: Zoom in on indicator descriptions and evidence
5. **Show test results**: Display the 35 passing tests
6. **Show the code**: Briefly show the detection rules or TypeScript types

## Common Questions

**Q: Why not use an ML model?**
A: For a 7-day MVP, transparent rules-based detection is faster to implement, easier to test, and more explainable. Users can understand exactly why a URL was flagged.

**Q: Why no external threat intelligence?**
A: To keep permissions minimal and protect privacy. External APIs would require API keys (security risk) and potentially transmit URLs (privacy concern). Can be added later with user consent.

**Q: What about false positives?**
A: Documented in README and SECURITY.md. Legitimate URLs like shorteners or new TLDs may trigger indicators. Users should always verify through official channels.

**Q: Is this production-ready?**
A: Yes for the MVP scope. It has comprehensive tests, clean architecture, and clear documentation. Future versions would add external threat intelligence and more sophisticated detection.
