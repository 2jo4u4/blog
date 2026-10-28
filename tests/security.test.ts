import { describe, it, expect, beforeEach } from "vitest";
import app, { loginRateLimiter } from "../src/index";
import { createSessionToken, verifySessionToken } from "../src/lib/auth";
import { MockD1Database } from "./helpers/mockDb";

const SECRET = "portfolio-auth-secret-key-2026";

describe("Security Hardening & Verification Suite", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = new MockD1Database();
    loginRateLimiter?.clear();
  });

  describe("1. HTTP Security Headers & CSP", () => {
    it("enforces standard defensive headers on landing page (/)", async () => {
      const res = await app.request("http://localhost/");
      expect(res.status).toBe(200);

      // Frame Options (Clickjacking defense)
      expect(res.headers.get("x-frame-options")).toBe("DENY");

      // MIME sniffing protection
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");

      // Strict Transport Security (HSTS)
      expect(res.headers.get("strict-transport-security")).toContain("max-age=");

      // Referrer Policy
      expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");

      // Content Security Policy
      const csp = res.headers.get("content-security-policy");
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    });

    it("enforces security headers on blog route (/blog)", async () => {
      const res = await app.request("http://localhost/blog", {}, { DB: mockDb });
      expect(res.status).toBe(200);
      expect(res.headers.get("x-frame-options")).toBe("DENY");
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    });

    it("enforces security headers on API routes (/health)", async () => {
      const res = await app.request("http://localhost/health");
      expect(res.status).toBe(200);
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
      expect(res.headers.get("x-frame-options")).toBe("DENY");
    });
  });

  describe("2. Session Token Hard Expiration & Tamper Resistance", () => {
    it("accepts freshly created token", async () => {
      const token = await createSessionToken(SECRET);
      const isValid = await verifySessionToken(token, SECRET);
      expect(isValid).toBe(true);
    });

    it("rejects token older than 7 days (fail-closed 7-day hard expiry)", async () => {
      // Create a token from 8 days ago
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const expiredPayload = `admin_${eightDaysAgo}`;

      // Sign the payload with the legitimate secret
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", key, enc.encode(expiredPayload));
      const sigHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expiredToken = `${expiredPayload}.${sigHex}`;

      const isValid = await verifySessionToken(expiredToken, SECRET);
      expect(isValid).toBe(false);
    });

    it("rejects future-skewed token (clock tamper beyond 1 minute)", async () => {
      const futureTime = Date.now() + 5 * 60 * 1000; // 5 minutes in future
      const futurePayload = `admin_${futureTime}`;

      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", key, enc.encode(futurePayload));
      const sigHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const futureToken = `${futurePayload}.${sigHex}`;

      const isValid = await verifySessionToken(futureToken, SECRET);
      expect(isValid).toBe(false);
    });

    it("rejects tampered signature or invalid payload", async () => {
      const token = await createSessionToken(SECRET);
      const tampered = token.replace("admin_", "hacker_");
      const isValid = await verifySessionToken(tampered, SECRET);
      expect(isValid).toBe(false);
    });
  });

  describe("3. Login Brute-Force Rate Limiting (/admin/login)", () => {
    it("allows up to 5 failed attempts, then returns 429 Too Many Requests on the 6th", async () => {
      const clientIp = "203.0.113.195";

      // Attempts 1 to 5: Invalid credentials -> 401 Unauthorized
      for (let i = 1; i <= 5; i++) {
        const formData = new FormData();
        formData.append("username", "admin");
        formData.append("password", `wrong-pass-${i}`);

        const res = await app.request(
          "http://localhost/admin/login",
          {
            method: "POST",
            headers: {
              "cf-connecting-ip": clientIp,
            },
            body: formData,
          },
          { DB: mockDb }
        );
        expect(res.status).toBe(401);
      }

      // 6th Attempt: Rate limited -> 429 Too Many Requests
      const blockedFormData = new FormData();
      blockedFormData.append("username", "admin");
      blockedFormData.append("password", "wrong-pass-6");

      const blockedRes = await app.request(
        "http://localhost/admin/login",
        {
          method: "POST",
          headers: {
            "cf-connecting-ip": clientIp,
          },
          body: blockedFormData,
        },
        { DB: mockDb }
      );
      expect(blockedRes.status).toBe(429);
      const text = await blockedRes.text();
      expect(text).toContain("Too many failed login attempts");
    });

    it("does not block different IP addresses when one IP is rate limited", async () => {
      const blockedIp = "203.0.113.10";
      const goodIp = "198.51.100.25";

      // Trigger rate limit for blockedIp
      for (let i = 1; i <= 6; i++) {
        const formData = new FormData();
        formData.append("username", "admin");
        formData.append("password", "wrong");

        await app.request(
          "http://localhost/admin/login",
          {
            method: "POST",
            headers: {
              "cf-connecting-ip": blockedIp,
            },
            body: formData,
          },
          { DB: mockDb }
        );
      }

      // Check goodIp is NOT rate limited
      const goodFormData = new FormData();
      goodFormData.append("username", "admin");
      goodFormData.append("password", "wrong");

      const res = await app.request(
        "http://localhost/admin/login",
        {
          method: "POST",
          headers: {
            "cf-connecting-ip": goodIp,
          },
          body: goodFormData,
        },
        { DB: mockDb }
      );
      expect(res.status).toBe(401); // 401 not 429
    });

    it("resets failure counter on successful login", async () => {
      const clientIp = "203.0.113.88";

      // 3 failed attempts
      for (let i = 1; i <= 3; i++) {
        const formData = new FormData();
        formData.append("username", "admin");
        formData.append("password", "wrong");

        await app.request(
          "http://localhost/admin/login",
          {
            method: "POST",
            headers: {
              "cf-connecting-ip": clientIp,
            },
            body: formData,
          },
          { DB: mockDb }
        );
      }

      // Successful login with correct credentials
      const successFormData = new FormData();
      successFormData.append("username", "test_admin");
      successFormData.append("password", "test_password_123");

      const loginRes = await app.request(
        "http://localhost/admin/login",
        {
          method: "POST",
          headers: {
            "cf-connecting-ip": clientIp,
          },
          body: successFormData,
        },
        { DB: mockDb }
      );
      expect(loginRes.status).toBe(302); // Redirect to /admin

      // Verify failure counter was reset
      expect(loginRateLimiter.isBlocked(clientIp)).toBe(false);
    });
  });

  describe("4. SQL Injection Protection Verification", () => {
    it("handles SQL injection payloads in tag parameter safely without exposing raw SQL errors", async () => {
      const maliciousTag = "React' OR '1'='1";
      const res = await app.request(
        `http://localhost/blog?tag=${encodeURIComponent(maliciousTag)}`,
        {},
        { DB: mockDb }
      );
      expect(res.status).toBe(200);
      const html = await res.text();
      // Should cleanly show empty state or filtered posts, not SQL syntax error
      expect(html).not.toContain("SQLITE_ERROR");
      expect(html).not.toContain("syntax error");
    });
  });
});
