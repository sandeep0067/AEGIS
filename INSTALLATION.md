# Installation and Testing Guide

## Prerequisites

- Node.js 18+ and npm
- Google Chrome browser
- Git (for cloning)

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AEGIS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

This will create a `dist/` folder with the built extension files.

### 4. Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `dist` folder from the AEGIS project
6. The extension should now appear in your extensions list

## Testing the Extension

### Manual Testing

1. Click the AEGIS icon in your Chrome toolbar
2. Enter a URL to analyze:
   - **Safe URL**: `https://example.com`
   - **Suspicious URL**: `https://google-security.com`
   - **IP Address**: `https://192.168.1.1`
   - **Executable**: `https://example.com/file.exe`
3. Click "Analyze URL"
4. Review the analysis results
5. Check the scan history at the bottom

### Test URLs

#### Benign URLs (should show "Safe")
- `https://example.com`
- `https://google.com`
- `https://blog.example.com`
- `https://github.com`

#### Suspicious URLs (should trigger indicators)
- `https://google-security.com` (lookalike domain)
- `https://g0ogle-login.com` (character substitution)
- `https://192.168.1.1/login` (IP address)
- `https://example.xyz` (suspicious TLD)
- `https://a.b.c.d.e.example.com` (excessive subdomains)
- `https://example.com/download/file.exe` (executable file)

### Running Unit Tests

```bash
npm test
```

This runs all unit tests using Vitest:
- URL parser tests (13 tests)
- Detection rules tests (10 tests)
- Integration tests (12 tests)

## Development Workflow

### Making Changes

1. Edit source files in `src/`
2. Run `npm run build` to rebuild
3. Go to `chrome://extensions/`
4. Click the refresh icon on the AEGIS extension card
5. Test the changes

### Hot Reloading (Development)

For faster development, you can use Vite's dev server:

```bash
npm run dev
```

Note: This is for UI development only. For full extension testing, you still need to build and reload in Chrome.

## File Structure

```
AEGIS/
├── dist/              # Built extension (load this in Chrome)
├── src/
│   ├── components/    # React components
│   ├── utils/         # URL parsing and detection logic
│   ├── types/         # TypeScript type definitions
│   └── styles/        # CSS/Tailwind
├── tests/             # Unit tests
├── public/            # Static assets (icons)
├── manifest.json      # Chrome extension manifest
└── package.json       # Dependencies and scripts
```

## Troubleshooting

### Extension doesn't load
- Ensure you built the extension: `npm run build`
- Check that you're loading the `dist` folder, not the project root
- Check Chrome's extension errors (click "Errors" button on extension card)

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@types/chrome` is installed

### Build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Run `npm run build`

### Tests fail
- Ensure all dependencies are installed
- Check the test output for specific failures
- Run tests in watch mode: `npm test -- --watch`

## Uninstalling

1. Go to `chrome://extensions/`
2. Find AEGIS in the list
3. Click "Remove"
4. Confirm removal

## Next Steps

After testing the MVP:

1. **Test with real URLs**: Try URLs from your inbox, social media, etc.
2. **Check false positives**: Test legitimate URLs to see if they trigger indicators
3. **Review documentation**: Read README.md, SECURITY.md, and ARCHITECTURE.md
4. **Consider enhancements**: See README.md for future improvement ideas
5. **Prepare for release**: Take screenshots, create demo video, update README

## Building for Production

The current build is production-ready. To publish to the Chrome Web Store:

1. Create a Chrome Web Store Developer account
2. Zip the `dist/` folder
3. Upload to the Chrome Web Store Developer Dashboard
4. Fill in store listing details
5. Submit for review

Note: The extension currently uses only the `storage` permission, which typically doesn't require additional review.
