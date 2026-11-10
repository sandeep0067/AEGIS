# AEGIS 

AEGIS is a privacy-first Chrome extension that checks a URL for common phishing signals and explains what it finds. Analysis runs locally in the browser; results are indicators, not a guarantee that a site is safe or malicious.

## What it does

- Analyze a URL from the extension popup without opening it.
- Check for lookalike brand names, suspicious subdomains and top-level domains, raw IP addresses, excessive encoding, executable file paths, and unusual query patterns.
- Show a transparent risk category (safe, low, medium, high, or critical), with an explanation for each triggered rule.
- Keep a local scan history that can be cleared from the popup.

AEGIS uses local rules and does not query an external reputation service. It cannot catch every threat, and legitimate URLs can trigger warnings. Treat results as a useful signal and verify important links through a trusted channel.

## Install in Chrome

### Build from source

Requirements: Node.js and npm, plus Google Chrome.

```bash
git clone https://github.com/sandeep0067/AEGIS.git
cd AEGIS
npm install
npm run build
```

Then open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the generated `dist/` directory. Click the AEGIS toolbar icon to inspect the current page URL.

## Development

```bash
npm install
npm run dev       # Popup UI development server
npm run build     # Type-check and create the extension in dist/
npm test          # Run the Vitest suite
npm run lint      # Run oxlint
```

After rebuilding, return to `chrome://extensions` and reload AEGIS to load the latest extension files.

## How it works

The popup passes the selected URL through a parser and a set of explainable detection rules. A scoring function combines the findings into a risk category. The popup displays the result and stores scan history with Chrome's local storage API. The extension manifest requests the `storage` permission for that history.

See [ARCHITECTURE.md](ARCHITECTURE.md) for design details, [INSTALLATION.md](INSTALLATION.md) for setup and manual checks, [DEMO.md](DEMO.md) for example scenarios, and [SECURITY.md](SECURITY.md) for privacy and security notes.

## Privacy and limitations

- URL analysis is performed locally; URLs are not sent to a server by this version.
- Scan history is stored in the browser using `chrome.storage.local`.
- A “safe” result only means these rules found no indicators. It does not certify a URL.
- The current release does not use threat-intelligence feeds or provide a complete real-time blocking service.

## Contributing

Issues and pull requests are welcome. Please include the behavior you observed, steps to reproduce it, and relevant test coverage when proposing a code change.

## License

AEGIS is available under the MIT License. See [LICENSE](LICENSE).
