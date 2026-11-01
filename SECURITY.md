# Security and Privacy Policy

## Permissions

AEGIS requests minimal browser permissions:

- **storage**: Required to save scan history locally using `chrome.storage.local`
  - Only stores URLs, risk levels, timestamps, and indicator counts
  - No personal data or credentials are stored
  - Data never leaves the user's browser

## Privacy

### Data Collection
- **No external data transmission**: URLs are analyzed locally in the browser
- **No tracking**: No analytics or user tracking
- **No telemetry**: No usage data is collected
- **Local-only storage**: Scan history is stored only in the user's browser

### URL Handling
- URLs are analyzed without navigating to them
- No network requests are made to the analyzed URLs
- No content is fetched from the analyzed URLs
- No cookies or credentials are transmitted

### Future Threat Intelligence Integration
If external threat-intelligence APIs are integrated in the future:
- API keys will be stored securely (never in frontend code)
- URLs will be hashed before transmission where possible
- Users will have clear opt-in consent
- Service-specific privacy policies will be documented

## Security Design

### Local-First Architecture
- All detection rules run locally in the browser
- No dependency on external services for core functionality
- Extension works offline

### Transparency
- Every detection rule produces a clear, human-readable explanation
- Risk categories are distinguishable from confirmed threats
- Limitations are clearly documented in the README

### Safe by Default
- No "safe" guarantees: Extension never claims a URL is definitively safe
- All analysis results are advisory
- Users are encouraged to verify URLs through official channels

## Known Limitations

### False Positives
Legitimate URLs may trigger indicators:
- Short URL services (bit.ly, etc.)
- New or uncommon TLDs
- Legitimate use of IP addresses in internal tools
- Brand names in non-official contexts

### False Negatives
Malicious URLs may not be detected:
- Sophisticated phishing that doesn't trigger local rules
- Zero-day phishing campaigns
- Malicious content not visible in URL structure
- Compromised legitimate domains

### Scope
- Extension requires manual URL inspection
- No real-time page scanning
- No automatic blocking of navigation
- No integration with browser security features

## Security Best Practices for Users

1. **Never rely solely on AEGIS**: Always verify URLs through official channels
2. **Check the source**: Verify who sent you the link
3. **Look for HTTPS**: Legitimate services use HTTPS
4. **Be skeptical**: If something seems too good to be true, it probably is
5. **Report phishing**: Use official channels to report suspicious URLs

## Vulnerability Reporting

If you discover a security vulnerability in AEGIS:
- Do not open a public issue
- Send details to the maintainer privately
- Include steps to reproduce
- Allow time for investigation and patching

## Version History

### v1.0.0
- Initial release
- Local-only URL analysis
- 6 detection rules
- Scan history with chrome.storage.local
- Minimal permissions (storage only)
