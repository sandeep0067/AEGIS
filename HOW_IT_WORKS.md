# How AEGIS Works

## Passive Monitoring Approach

AEGIS works automatically in the background as you browse. You don't need to manually enter URLs - the extension monitors your tabs and analyzes websites in real-time.

## Visual Indicators

### Extension Badge
The extension icon shows a badge indicating the security level of the current page:

- **✓ (Green)**: Safe - No suspicious indicators detected
- **! (Yellow)**: Low Risk - Minor suspicious patterns
- **⚠ (Orange)**: Medium Risk - Multiple suspicious indicators
- **⚠ (Red)**: High Risk - Strong signs of suspicious activity
- **✕ (Dark Red)**: Critical - Critical security risks

### Icon Changes
The extension icon also changes based on risk level:
- **Blue shield**: Default state
- **Green shield with checkmark**: Safe sites
- **Red shield with warning**: High/critical risk sites

## Automatic Analysis

### When It Runs
- When you navigate to a new page
- When you switch between tabs
- When the extension is first installed (analyzes existing tabs)

### What It Analyzes
- Hostname and domain structure
- Subdomain patterns
- Top-level domain (TLD)
- URL encoding
- File extensions
- Query parameters

### What It Skips
- Chrome internal pages (chrome://)
- Extension pages (chrome-extension://)
- About pages (about:)

## Warning Overlay

For **high** and **critical** risk sites, AEGIS shows an inline overlay on the page with:
- Security warning badge and icon
- Risk level (HIGH or CRITICAL)
- The suspicious URL
- Summary of detected indicators
- Options to:
  - Proceed anyway (I understand)
  - Go back to safety
  - Close and view details via extension icon

The overlay appears as a modal dialog on the page itself, similar to Chrome's native confirmation dialogs.

## Main Popup

Click the extension icon to see:
- Current page URL
- Risk level and explanation
- Recommended action
- Detailed list of detected indicators
- Scan history with previous analyses

## Detection Rules

AEGIS checks for:

1. **Lookalike Domains**: Brand name misuse (e.g., google-security.com)
2. **Character Substitutions**: g0ogle.com instead of google.com
3. **Suspicious Subdomains**: Excessive or randomly generated subdomains
4. **Suspicious TLDs**: Uncommon extensions (.xyz, .top, etc.)
5. **IP Addresses**: Raw IP addresses instead of domain names
6. **Encoding Abuse**: Excessive URL encoding
7. **Executable Files**: .exe, .bat, .scr in URLs
8. **Excessive Parameters**: Unusually many query parameters

## Privacy

- All analysis happens locally in your browser
- No URLs are sent to external servers
- No network requests to analyzed URLs
- Only `storage`, `tabs`, and `activeTab` permissions
- Scan history stored locally only

## Example Scenarios

### Safe Site
```
URL: https://example.com
Badge: ✓ (Green)
Icon: Green shield with checkmark
Warning: None
```

### Suspicious Site
```
URL: https://google-security.com
Badge: ⚠ (Red)
Icon: Red shield with warning
Warning: Popup appears with indicators
```

### Critical Risk
```
URL: https://example.com/download/file.exe
Badge: ✕ (Dark Red)
Icon: Red shield with warning
Warning: Popup appears with critical warning
```

## Customization

### Disabling Warnings
If you find warnings intrusive, you can:
- Click "I understand, let me proceed" to dismiss
- The warning won't show again for the same tab
- Click the extension icon to see detailed analysis

### Clearing History
1. Click the extension icon
2. Scroll to "Scan History"
3. Click "Clear History"

## Performance Impact

- Minimal CPU usage (local analysis only)
- No network requests for analysis
- Background service worker handles monitoring
- No impact on page load times
