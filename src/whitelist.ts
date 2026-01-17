export function isWhitelisted(domain: string, whitelist: string[]): boolean {
  return whitelist.includes(domain);
}
