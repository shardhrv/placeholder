import { getRemainingWhitelistMs, getSettings } from "../src/storage";
import { isWhitelisted } from "../src/whitelist";
import { mountOverlay } from "../src/overlay/load";
import { bindOverlayUI } from "../src/overlay/controller";
import { stopCornerTimer, startCornerTimer } from "../src/ui/timer";

async function block(domain: string) {
  const mount = await mountOverlay();
  bindOverlayUI(mount, domain);
}

function allowWithTimer(domain: string, whitelist: Record<string, number>) {
  stopCornerTimer();

  startCornerTimer(
    () => getRemainingWhitelistMs(domain, whitelist),
    async () => {
      // timer ended -> re-check latest settings and block if needed
      const fresh = await getSettings();
      if (!fresh.enabled) return;

      if (!isWhitelisted(domain, fresh.whitelist)) {
        stopCornerTimer();
        await block(domain);
      }
    }
  );
}

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  runAt: "document_idle",

  async main() {
    const { enabled, whitelist } = await getSettings();
    if (!enabled) return;

    const domain = window.location.href;

    if (isWhitelisted(domain, whitelist)) {
      allowWithTimer(domain, whitelist);
      return;
    }

    stopCornerTimer();
    await block(domain);
  },
});
