import { browser } from "@wxt-dev/browser";

export type Settings = {
  enabled: boolean;
  whitelist: string[];
};

export async function getSettings(): Promise<Settings> {
  const res = await browser.storage.sync.get(["enabled", "whitelist"]);
  return {
    enabled: Boolean(res.enabled),
    whitelist: Array.isArray(res.whitelist) ? (res.whitelist as string[]) : [],
  };
}

/**
 * Gets enabled setting
 * @returns boolean of whether the pop up is enabled
 */

export async function getEnabled(): Promise<boolean> {
  const res = await browser.storage.sync.get(["enabled"]);
  return Boolean(res.enabled);
}

/**
 * Set whether or not to enable setting
 * @param enabled boolean to set enabled to
 */
export async function setEnabled(enabled: boolean): Promise<void> {
  await browser.storage.sync.set({ enabled });
}

/**
 *   Adds website to not be blocked by the popup
 * @param domain string URL of the website
 */
export async function addToWhitelist(domain: string): Promise<void> {
  const res = await browser.storage.sync.get(["whitelist"]);
  const whitelist = Array.isArray(res.whitelist) ? (res.whitelist as string[]) : [];

  if (!whitelist.includes(domain)) {
    whitelist.push(domain);
    await browser.storage.sync.set({ whitelist });
  }
}
