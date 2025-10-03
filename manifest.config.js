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
        matches: ["http://*/*", "https://*/*"],
    }],
    permissions: [
        'contentSettings',
    ],
    web_accessible_resources: [
        {
            resources: ["content.js"],
            matches: ["http://*/*", "https://*/*"],
            use_dynamic_url: true,
        }
    ]
})
