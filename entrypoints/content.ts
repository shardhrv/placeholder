import { getSettings } from "../src/storage";
import { isWhitelisted } from "../src/whitelist";
import { mountOverlay } from "../src/overlay/load";
import { bindOverlayUI } from "../src/overlay/controller";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  runAt: "document_idle",

  async main() {
    const { enabled, whitelist } = await getSettings();
    if (!enabled) return;

    const domain = window.location.hostname;
    if (isWhitelisted(domain, whitelist)) return;

    const mount = await mountOverlay();
    bindOverlayUI(mount, domain);
  },
});


