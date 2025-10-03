import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.js'
import { name, version } from './package.json'
import ViteRestart from 'vite-plugin-restart'

export default defineConfig({
    resolve: {
        alias: {
            '@': `${path.resolve(__dirname, 'src')}`,
        },
    },
    plugins: [
        crx({ manifest }),
        zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
        ViteRestart({
            restart: [
                'src/**', // restart when anything inside /src changes
            ],
        }),
    ],
    server: {
        cors: {
            origin: [
                /chrome-extension:\/\//,
            ],
        },
    },
})
