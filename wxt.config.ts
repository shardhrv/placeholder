import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    manifest_version: 3,
    name: "Place Holder",
    version: "1.0.0",
    description: "Stop your scrolling and start learning something new instead!",

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
