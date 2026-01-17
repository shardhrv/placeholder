const TIMER_ID = "annoy-timer";

function format(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function startCornerTimer(getRemainingMs: () => number, onExpire: () => void) {
  // prevent duplicates
  let el = document.getElementById(TIMER_ID) as HTMLDivElement | null;

  if (!el) {
    el = document.createElement("div");
    el.id = TIMER_ID;
    el.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 1000000;
      background: rgba(0,0,0,0.75);
      color: white;
      padding: 8px 10px;
      border-radius: 10px;
      font: 600 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial;
      letter-spacing: 0.2px;
      user-select: none;
    `;
    document.documentElement.appendChild(el);
  }

  const tick = () => {
    const remaining = getRemainingMs();
    if (remaining <= 0) {
      stopCornerTimer();
      onExpire();
      return;
    }
    el!.textContent = `Unblocked: ${format(remaining)}`;
  };

  tick();
  const interval = window.setInterval(tick, 250);
  el.dataset.interval = String(interval);
}

export function stopCornerTimer() {
  const el = document.getElementById(TIMER_ID) as HTMLDivElement | null;
  if (!el) return;

  const interval = Number(el.dataset.interval);
  if (!Number.isNaN(interval)) window.clearInterval(interval);
  el.remove();
}