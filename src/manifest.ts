import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

export default defineManifest({
    name: packageData.name,
    version: packageData.version,
    manifest_version: 3,
    icons: {
        16: 'logo.png',
    },
    action: {
        // default_popup: 'popup.html',
        default_title: 'Magic DOM',
        // "default_title": "Click to open panel"
        default_icon: 'logo.png',
    },
    // options_page: 'options.html',
    // devtools_page: 'devtools.html',
    background: {
        service_worker: 'src/background/index.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['http://*/*', 'https://*/*'],
            js: ['src/contentScript/index.ts'],
        },
    ],
    // side_panel: {
    //     default_path: 'side-panel.html',
    // },
    permissions: ['sidePanel', 'storage', "contextMenus", "tabs", 'activeTab', 'nativeMessaging'],
    // chrome_url_overrides: {
    //   newtab: 'newtab.html',
    // },
})