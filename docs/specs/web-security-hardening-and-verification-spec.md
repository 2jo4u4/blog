# Spec: 網頁安全性防禦加固與自動化驗證套件 (Web Security Hardening & Verification Suite)

## Problem Statement

目前作品集與技術部落格雖然具備基本的 HMAC Session 簽章驗證與 Cloudflare D1 參數化查詢，但面對現代網路安全威脅時仍存在數項關鍵防禦盲點：

1. **缺乏標準 HTTP 安全防禦標頭 (Missing Security Headers)**：全站所有頁面與 API 目前均未配置 `X-Frame-Options`（導致點擊劫持 Clickjacking 風險）、`X-Content-Type-Options`（MIME 嗅探漏洞）、`Strict-Transport-Security` (HSTS) 與 `Content-Security-Policy` (CSP)，無法防止惡意網站將本站偽裝嵌入或防範非預期的外部腳本注入。
2. **Session Token 無絕對過期時效 (Missing Hard Expiry)**：目前的 HMAC Session Token 僅在建立時於載荷中記錄時間戳記，但伺服器端驗證邏輯僅驗證簽章合法性，從未校驗時間差。一旦 Token 外洩或被第三方攔截，攻擊者可永久無限期重放該 Token 登入後台。
3. **管理員登入介面缺乏防暴力破解機制 (No Login Brute-Force Protection)**：`/api/admin/login` 端點未設置任何嘗試次數限制或延遲策略，攻擊者可使用字典檔或自動化腳本進行無限制的高頻密碼爆破。

為了確保網站符合現代資安評分（如 Mozilla Observatory 與 SecurityHeaders）的高標要求，並保障管理者與訪客的資料安全，必須為系統構建全面的縱深防禦體系與自動化驗證套件。

---

## Solution

建立完整的邊緣安全強化體系與自動化測試防禦網：

1. **掛載實用型 HTTP 安全防禦標頭**：在邊緣網關層統一注入標準防禦標頭，包括強制 HTTPS、禁止 iframe 嵌套（防點擊劫持）、禁止 MIME 類型推測，並配置針對本站現有內嵌主題與時區腳本最佳化的實用型 Content Security Policy (CSP)。
2. **實作 Session Token 7 天絕對時效防禦**：伺服器端在驗證 Token HMAC 簽章的同時，嚴格解析建立時間戳記，一旦發現 Token 超過 7 天或時間戳記遭竄改為未來時間，一律採取 Fail-Closed 策略拒絕存取並回傳 401。
3. **引入記憶體滑動窗口防爆破速率限制 (Rate Limiting)**：在管理員登入端點設置 IP 級別的失敗計數器，在 15 分鐘窗口內最多允許 5 次密碼錯誤，第 6 次起直接封鎖並回傳 HTTP 429 Too Many Requests，成功登入時自動解除計數。
4. **構建專屬安全性自動化測試套件**：建立獨立的安全驗證測試檔案，整合進持續整合 (CI) 與提交前檢查，永久守護安全防線。

---

## User Stories

1. As a website owner, I want all pages to return an `X-Frame-Options: DENY` header, so that malicious websites cannot embed my portfolio into an iframe to execute clickjacking attacks against my visitors.
2. As a website owner, I want all responses to include `X-Content-Type-Options: nosniff`, so that browsers strictly respect declared MIME types and refuse to execute malicious executable files disguised as images or stylesheets.
3. As a website owner, I want a `Strict-Transport-Security` (HSTS) header enforced across all edge responses, so that modern browsers automatically upgrade all HTTP requests to encrypted HTTPS connections and resist man-in-the-middle downgrades.
4. As a security-conscious administrator, I want a well-tuned Content Security Policy (CSP), so that unauthorized external tracking or injection scripts are strictly blocked by the browser while legitimate inline theme and progressive enhancement scripts execute without disruption.
5. As a content administrator, I want my authenticated session token to expire automatically after 7 days, so that if a session cookie or token is inadvertently leaked, its exposure window is strictly limited.
6. As a security auditor, I want any session token with an expired timestamp or a future-tampered timestamp to be rejected immediately with HTTP 401 Unauthorized, so that replay attacks and timestamp manipulation are impossible.
7. As a system administrator, I want the login API to throttle repeated failed attempts from the same IP address, so that automated dictionary and brute-force attacks against the admin account are halted with HTTP 429 Too Many Requests.
8. As a legitimate administrator who makes an occasional typo, I want up to 5 failed login attempts within 15 minutes before being rate-limited, so that human mistakes do not immediately lock me out of my dashboard.
9. As a legitimate administrator logging in after a failed attempt, I want a successful login to reset my IP failure counter immediately, so that my subsequent administrative operations are never throttled.
10. As an edge software developer, I want all database queries to strictly utilize parameterized SQL bindings, so that SQL injection attempts via search queries or URL tags fail safely without compromising data integrity.
11. As a CI/CD engineer, I want automated security tests in `tests/security.test.ts` to run on every commit and pull request via `npm run check`, so that any accidental security regression is detected and blocked before reaching production.

---

## Implementation Decisions

- **Edge Security Headers Integration**:
  - Adopt Hono's native security headers middleware in the edge application pipeline.
  - Required Header configurations:
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Content-Security-Policy`:
      - `default-src 'self'`
      - `script-src 'self' 'unsafe-inline'`
      - `style-src 'self' 'unsafe-inline'`
      - `img-src 'self' data: https:`
      - `connect-src 'self'`
- **Session Hard Expiration (7-Day Hard Limit)**:
  - In the session token verification module, parse the payload structure (`admin_<timestamp>`).
  - Compute `elapsed = currentTime - timestamp`.
  - Condition: If `elapsed > 7 * 86400 * 1000` (7 days in milliseconds) or `timestamp > currentTime + 60000` (tampered future time beyond 1-minute clock drift tolerance), fail-closed and return `false`.
  - Ensure zero backward-compatibility traps: Any malformed or non-numeric timestamp payload must safely return `false`.
- **In-Memory Sliding-Window Login Rate Limiter**:
  - Implement a lightweight, zero-dependency in-memory rate limiting map scoped to `/api/admin/login`.
  - Key: Client IP extracted from standard edge headers (`cf-connecting-ip`, `x-forwarded-for`, or fallback).
  - State per IP: Array of failed attempt timestamps or a window counter with reset epoch.
  - Window: 15 minutes (900,000 ms).
  - Threshold: Maximum 5 failed attempts per window.
  - Behavior on 6th failed attempt: Short-circuit immediately, return HTTP 429 Too Many Requests with informative JSON message (`{"error": "Too many failed login attempts. Please try again later."}`), avoiding redundant D1 database queries or password hashing computations.
  - Behavior on successful authentication: Delete or reset the IP's failed attempts ledger.
- **Fail-Closed Security Standard**:
  - All unauthorized requests to admin views or API endpoints must continue to fail closed with HTTP 401 or redirect to `/admin/login`.

---

## Testing Decisions

- **What makes a good test**:
  - Tests must assert external HTTP contracts, status codes, and response headers across realistic synthetic requests (`app.request()`), without spying on or mocking internal middleware implementations.
  - Edge cases must be explicitly asserted:
    - Fresh token (valid) vs expired token (rejected).
    - Future-skewed token (rejected).
    - 5 sequential failed logins (HTTP 401) vs 6th attempt (HTTP 429).
    - Different IP address isolation (blocking IP A must not block IP B).
    - Success reset (valid login clears the throttle).
    - SQL injection payloads (`' OR 1=1 --`, `UNION SELECT`) handled safely.
- **Modules to be tested**:
  - Dedicated test suite in `tests/security.test.ts`.
  - Edge request router pipeline (`src/index.tsx`).
  - Authentication utility module (`src/lib/auth.ts`).
- **Prior art**:
  - Follows established test seam conventions in `tests/admin.test.ts` and `tests/index.test.ts` using synthetic `app.request` with mock D1 database.

---

## Out of Scope

- Introducing third-party CAPTCHA widgets (e.g. Turnstile, reCAPTCHA) on the login form. The in-memory rate limiter provides sufficient protection for a personal portfolio without degrading UX.
- Two-Factor Authentication (2FA / TOTP). Single-administrator HMAC session with SHA-256 database authentication fulfills all current operational requirements.
- Dynamic nonce-generation per request for CSP. Standard pragmatic CSP with `'unsafe-inline'` satisfies the security-performance balance without breaking edge SSR caching.

---

## Further Notes

- The rate limiter runs directly within the Cloudflare Worker runtime memory space. For extreme enterprise-grade multi-region synchronized DDoS mitigation, Cloudflare Dashboard WAF rules can complement this in-memory defense layer without any code changes.
