import { browser } from "@wxt-dev/browser";

export type OverlayMount = {
  overlay: HTMLElement;
  styleTag: HTMLStyleElement;
};

export async function mountOverlay(): Promise<OverlayMount> {
  const existing = document.getElementById("annoy-overlay");
  const existingStyle = document.getElementById("annoy-style");
  if (existing && existingStyle) {
    return {
      overlay: existing as HTMLElement,
      styleTag: existingStyle as HTMLStyleElement,
    };
  }

  const [html, css] = await Promise.all([
    fetch(browser.runtime.getURL("overlay.html")).then((r) => r.text()),
    fetch(browser.runtime.getURL("overlay.css")).then((r) => r.text()),
  ]);

  const styleTag = document.createElement("style");
  styleTag.id = "annoy-style";
  styleTag.textContent = css;
  document.documentElement.appendChild(styleTag);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  const overlay = wrapper.firstElementChild as HTMLElement | null;

  if (!overlay) {
    styleTag.remove();
    throw new Error("overlay.html has no root element");
  }

  document.documentElement.appendChild(overlay);
  return { overlay, styleTag };
}

export function unmountOverlay(): void {
  document.getElementById("annoy-overlay")?.remove();
  document.getElementById("annoy-style")?.remove();
}
