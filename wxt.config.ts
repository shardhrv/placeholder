import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    manifest_version: 3,
    name: "test extension",
    version: "0.1.0",
    description: "irritate the user :)",

    permissions: ["storage"],

    action: {
        default_popup: "popup/index.html"
    },

    web_accessible_resources: [
        {
            resources: ["overlay.html", "overlay.css"],
            matches: ["http://*/*", "https://*/*"]
        }
    ]
  },
});
