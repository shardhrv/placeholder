import { getRemainingWhitelistMs, getSettings } from "../src/storage";
import { isWhitelisted } from "../src/whitelist";
import { mountOverlay } from "../src/overlay/load";
import { bindOverlayUI } from "../src/overlay/controller";
import { stopCornerTimer, startCornerTimer } from "../src/ui/timer";

async function block(pageKey: string) {
  stopCornerTimer();
  const mount = await mountOverlay();
  bindOverlayUI(mount, pageKey);
}

function allowWithTimer(pageKey: string, whitelist: Record<string, number>) {
  stopCornerTimer();

  startCornerTimer(
    () => getRemainingWhitelistMs(pageKey, whitelist),
    async () => {
      const fresh = await getSettings();
      if (!fresh.enabled) return;

      const currentKey = window.location.href;
      if (!isWhitelisted(currentKey, fresh.whitelist)) {
        await block(currentKey);
      }
    }
  );
}

async function evaluate() {
  const { enabled, whitelist } = await getSettings();
  if (!enabled) return;

  const pageKey = window.location.href;

  if (isWhitelisted(pageKey, whitelist)) {
    allowWithTimer(pageKey, whitelist);
  } else {
    await block(pageKey);
  }
}

function watchSpaNavigations(onChange: () => void) {
  let last = location.href;

  const check = () => {
    if (location.href !== last) {
      last = location.href;
      onChange();
    }
  };

  function wrap(type: "pushState" | "replaceState") {
    const original = history[type];

    history[type] = function (
      this: History,
      ...args: Parameters<History["pushState"]>
    ) {
      const ret = original.apply(this, args);
      check();
      return ret;
    };
  }

  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", check);

  const interval = setInterval(check, 500);
  return () => clearInterval(interval);
}


export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  runAt: "document_idle",

  async main() {
    await evaluate();
    watchSpaNavigations(evaluate);
  },
});
