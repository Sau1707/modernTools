# modernTools

A modern Chrome extension built with Vite + crxjs.

## Features

- ⚡️ **Vite** - Fast build tool and development server
- 🎨 **Modern UI** - Clean, gradient-based popup interface
- 🛠️ **Content Script** - Interactive badge on web pages
- 📦 **Service Worker** - Background processing with Manifest V3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

This will create a `dist` folder with the extension build. To load it in Chrome:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project

**Note:** After making code changes, you'll need to manually reload the extension in Chrome to see updates. Click the reload icon on the extension card in `chrome://extensions/`.

### Build for Production

Build the extension for production:
```bash
npm run build
```

The production-ready extension will be in the `dist` folder.

## Project Structure

```
modernTools/
├── src/
│   ├── popup/          # Extension popup UI
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── background/     # Service worker
│   │   └── background.js
│   └── content/        # Content scripts
│       └── content.js
├── public/             # Static assets (icons)
├── manifest.json       # Extension manifest
├── vite.config.js      # Vite configuration
└── package.json
```

## How It Works

- **Popup**: Click the extension icon to open a popup that can interact with the current page
- **Content Script**: Adds a floating badge to every webpage you visit
- **Background Worker**: Handles extension lifecycle and message passing

## Technologies

- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) - Chrome Extension support for Vite
- Chrome Extension Manifest V3
