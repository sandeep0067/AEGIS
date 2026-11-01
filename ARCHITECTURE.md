# AEGIS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  URL Input   │  │   Analysis    │  │   History    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     URL Parser Module                        │
│  • Normalize URL (add protocol, remove tracking params)    │
│  • Parse components (hostname, domain, subdomains, etc.)    │
│  • Validate URL format                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Detection Rules Engine                     │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │ Lookalike      │  │ Suspicious     │                    │
│  │ Domains        │  │ Subdomains     │                    │
│  └────────────────┘  └────────────────┘                    │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │ Suspicious     │  │ IP Address     │                    │
│  │ TLDs           │  │ Detection      │                    │
│  └────────────────┘  └────────────────┘                    │
│  ┌────────────────┐  ┌────────────────┐                    │
│  │ Encoding       │  │ Suspicious     │                    │
│  │ Abuse          │  │ Patterns       │                    │
│  └────────────────┘  └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Scoring Engine                             │
│  • Aggregate indicators                                      │
│  • Calculate risk level (safe/low/medium/high/critical)      │
│  • Generate human-readable explanations                     │
│  • Provide recommended actions                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Optional: Threat Intelligence API               │
│  • Google Safe Browsing (not implemented in MVP)             │
│  • VirusTotal API (not implemented in MVP)                    │
│  • Other reputation services (not implemented in MVP)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Chrome Storage                             │
│  • Save scan history (last 50 scans)                         │
│  • Local browser storage only                                │
│  • No external data transmission                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **User Input**: User enters URL in popup
2. **URL Parsing**: URL is normalized and parsed into components
3. **Detection Rules**: Each rule checks for suspicious patterns
4. **Scoring**: Indicators are aggregated into a risk level
5. **Result Display**: Analysis is shown with explanations
6. **History Storage**: Result is saved to chrome.storage.local

## Module Descriptions

### URL Parser (`src/utils/urlParser.ts`)
- **Purpose**: Safely parse and normalize URLs
- **Key Functions**:
  - `normalizeURL()`: Add protocol, remove tracking parameters
  - `parseURL()`: Extract hostname, domain, subdomains, etc.
  - `isValidURL()`: Validate URL format
  - `isIPAddress()`: Detect IP address usage

### Detection Rules (`src/utils/detectionRules.ts`)
- **Purpose**: Identify suspicious URL patterns
- **Rules**:
  1. Lookalike domains (brand name misuse)
  2. Suspicious subdomains (excessive/random)
  3. Suspicious TLDs (uncommon extensions)
  4. IP address detection
  5. Encoding abuse (excessive percent-encoding)
  6. Suspicious patterns (executables, excessive params)

### Scoring Engine (`src/utils/scoring.ts`)
- **Purpose**: Convert indicators into risk categories
- **Risk Levels**: safe, low, medium, high, critical
- **Outputs**: Risk explanation, recommended action

### React Components (`src/components/`)
- **Popup.tsx**: Main popup container
- **URLInput.tsx**: URL input form
- **AnalysisResult.tsx**: Display analysis results
- **History.tsx**: Scan history viewer
- **RiskBadge.tsx**: Risk level indicator

### Background Script (`src/background.ts`)
- **Purpose**: Extension lifecycle management
- **Functions**: Installation event handling

## Technology Stack

- **Browser Extension**: Chrome Extension Manifest V3
- **UI Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest
- **Storage**: chrome.storage.local

## Security Considerations

### Local-First Design
- All analysis happens in the browser
- No URLs are transmitted to external servers
- No network requests to analyzed URLs

### Minimal Permissions
- Only `storage` permission required
- No access to tabs, browsing history, or web requests
- No content scripts injected into pages

### Transparent Detection
- Every rule produces a clear explanation
- Risk categories are advisory, not definitive
- Limitations are clearly documented

## Extension Points

### Future Threat Intelligence Integration
When integrating external APIs:
1. Add `reputation.ts` module for API calls
2. Store API keys securely (chrome.storage.local with encryption)
3. Hash URLs before transmission where possible
4. Add opt-in consent for external API usage
5. Clearly distinguish local vs. external results

### Additional Detection Rules
New rules can be added to `detectionRules.ts`:
1. Implement rule function returning `RiskIndicator | null`
2. Add to `runDetectionRules()` function
3. Add corresponding unit tests
4. Update documentation

### UI Enhancements
Possible improvements:
- Dark mode support
- Customizable risk thresholds
- Export scan history
- Keyboard shortcuts
- Context menu integration
