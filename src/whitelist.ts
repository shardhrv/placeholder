export function isWhitelisted(domain: string, whitelist: Record<string, number>): boolean {
  // Check if domain exists
  if (!whitelist[domain]) {
    return false;
  }
  
  // Check if expired
  const expiryTime = whitelist[domain];
  const now = Date.now();
  
  if (now > expiryTime) {
    console.log(`⏰ Whitelist expired for ${domain}`);
    return false;
  }
  
  const minutesLeft = Math.floor((expiryTime - now) / (1000 * 60));
  console.log(`✅ ${domain} is whitelisted (${minutesLeft} minutes remaining)`);
  return true;
}