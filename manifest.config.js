import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    icons: {
        48: 'public/logo.png',
    },
    action: {
        default_icon: {
            48: 'public/logo.png',
        },
        default_popup: 'src/popup/index.html',
    },
    content_scripts: [{
        js: ["inject.js"],
        all_frames: true,
        matches: ["*://*.grepolis.com/*"],
    }],
    permissions: [
        'contentSettings',
    ],
    web_accessible_resources: [
        {
            resources: ["src/content/*"],
            matches: ["*://*.grepolis.com/*"],
            use_dynamic_url: true,
        }
    ]
})
