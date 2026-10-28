export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === expectedHash;
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = `admin_${Date.now()}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${sigHex}`;
}

const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days hard expiry
const MAX_FUTURE_SKEW_MS = 60 * 1000; // 1 minute clock skew tolerance

export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs = Date.now()
): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const [payload, sigHex] = token.split(".");
  if (!payload || !sigHex) return false;

  // Validate payload format and parse timestamp
  if (!payload.startsWith("admin_")) return false;
  const timestampStr = payload.slice(6);
  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp)) return false;

  // Validate hard expiry (7 days)
  const elapsed = nowMs - timestamp;
  if (elapsed > MAX_SESSION_AGE_MS) return false;

  // Validate future skew tolerance (max 1 minute ahead)
  if (timestamp > nowMs + MAX_FUTURE_SKEW_MS) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const matchBytes = sigHex.match(/.{1,2}/g);
  if (!matchBytes) return false;
  const signature = new Uint8Array(matchBytes.map((byte) => parseInt(byte, 16)));

  return await crypto.subtle.verify("HMAC", key, signature, enc.encode(payload));
}
