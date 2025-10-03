# Window Object Access

## Overview
This Chrome extension includes a script that can access the actual `window` object of the page, not the isolated content script context.

## Implementation

### Files
- `src/content/window-script.js` - Script that runs in the page's main world and has access to the window object
- `manifest.config.js` - Updated to include the window-script with `world: 'MAIN'` configuration

### How It Works

Chrome extensions typically run content scripts in an isolated context that cannot access the page's actual `window` object. To access the real page window, we use the Manifest V3 `world: 'MAIN'` feature:

```javascript
content_scripts: [
    {
        js: ['src/content/window-script.js'],
        matches: ["https://*.grepolis.com/*"],
        world: 'MAIN',  // This makes the script run in the page's context
    }
]
```

### Testing

When you load this extension and visit a matching URL (https://*.grepolis.com/*), you'll see:
1. `[CRXJS] Window script loaded in MAIN world!` message in the console
2. The actual `window` object of the page logged to the console

This proves that the script has access to the page's window object, not the isolated extension context.

### Browser Requirements
The `world: 'MAIN'` feature requires Chrome 111 or later.
