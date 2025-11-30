import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "mahindra-hibiscus",
  description: "A Chromium extension to check Mahindra Adrenox and Imaxx in bulk. ⚡️",
  version: "1.4",
  icons: {
    16: "icon.png",
    32: "icon.png",
    48: "icon.png",
    128: "icon.png"
  },
  action: {
    default_popup: "index.html",
  },
  permissions: [
    "storage",
    "webRequest",
    "scripting",
    "activeTab"
  ],
  host_permissions: [
    "*://localhost:*/*",
    "*://mahindr.appwrite.network/*",
    "*://*.mahindramobilitysolution.com/*"
  ],
  background: {
    service_worker: "src/background.ts"
  }
});
