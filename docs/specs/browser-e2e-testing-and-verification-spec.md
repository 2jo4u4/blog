# Spec: 全站瀏覽器端對端驗證與視覺回歸測試計畫 (Full-Site Browser E2E Verification & Visual Regression Plan)

## Problem Statement

目前作品集與技術部落格雖然具備完整的 Vitest 單元與整合測試套件（47 項測試全數通過），透過模擬請求 `app.request()` 嚴密驗證了 HTTP 狀態碼、HMAC Session 簽章、安全防禦標頭與邊緣 SSR 輸出字串，但在真實瀏覽器運行時仍存在數項無法由單元測試覆蓋的驗證盲點：

1. **真實 CSS 引擎排版與響應式斷點驗證缺失 (Missing Layout & RWD Visual Verification)**：Tailwind CSS v4 在真實排版引擎中的 Grid 欄位配置、彈性盒子折行（Flex wrap）、手機螢幕（390px）下的觸控邊界與收合行距，無法透過單純的 HTML 字串比對確認其視覺完整性。
2. **客戶端微互動與視覺對比體驗未經實機核對 (Unverified Interactive Micro-interactions & Contrast)**：先前面對深淺主題切換（Dark/Light Mode）按鈕眩光調整、SoundCraft EQ 全寬展示卡片多圖切換、維護徽章（`● v1.0 架構重構・新版維護審核中`）閃爍動態、中英雙語文字切換，以及單篇文章頁 TOC 目錄錨點平滑滾動，尚未在真實瀏覽器視口下留下可視覺比對的截圖存證。
3. **瀏覽器端安全防禦實際運作狀態未經即時診斷 (Unverified Browser Runtime Security)**：雖然伺服器已注入 CSP 與 `X-Frame-Options: DENY`，但真實瀏覽器運行時是否會產生非預期的 CSP 違規警告（例如 inline script 或 inline style 報錯）、以及 iframe 嵌層是否確實被瀏覽器強制攔截阻擋，需要透過瀏覽器 DevTools 與 DOM 實機檢驗。
4. **429 速率限制之瀏覽器實際視覺反饋 (429 Rate Limiter Live UX Verification)**：管理員在登入失敗達 5 次後，第 6 次觸發的 HTTP 429 畫面在瀏覽器端是否清晰友善、是否保留輸入上下文並正確阻斷後續請求，需進行端對端實機走訪。

---

## Solution

建立由實機驅動的端對端（E2E）瀏覽器驗證體系：

1. **統一以單一最高層級測試縫（Single Highest Seam）驅動驗證**：透過本地運行的邊緣伺服器（`wrangler dev`，預設 `http://localhost:8787`），完全模擬 Cloudflare Workers、本地 D1 資料庫與 `./public` 編譯靜態資源，以真實瀏覽器環境進行全黑箱式測試。
2. **多視口（Dual Viewports）視覺回歸檢驗**：統一於 **1440 × 900（Desktop 寬螢幕）** 與 **390 × 844（Mobile 智慧型手機）** 雙重視口下執行走訪與高畫質截圖比對。
3. **走訪四大核心使用者旅程**：
   - 旅程 1：公開首頁、Hero、經歷時間軸、技術棧標籤、SoundCraft EQ 商店截圖與雙語切換、主題對比度。
   - 旅程 2：技術部落格文章列表、標籤過濾、空狀態提示、單篇文章 Edge SSR 渲染、Markdown 代碼高亮、TOC 目錄滾動。
   - 旅程 3：管理員登入介面、連續 5 次錯誤登入後觸發第 6 次 HTTP 429 警告頁面視覺存證、以 `test_admin` 成功登入與發布生命週期。
   - 旅程 4：瀏覽器 Console 零 CSP 違規確認、iframe 點擊劫持阻斷驗證。
4. **雙軌成果交付**：在對話中生成互動式 Markdown 驗收報告（Artifact），並將完整測試紀錄持久化歸檔至專案文件。

---

## User Stories

1. As a desktop visitor, I want the portfolio landing page to render with clean typography, well-balanced margins, and sharp layout at 1440x900 resolution, so that I can quickly assess the developer's professional capabilities.
2. As a mobile smartphone user, I want the landing page to adapt gracefully to a 390x844 viewport without horizontal scrollbars or overflowing text, so that I can navigate the portfolio smoothly on my phone.
3. As a hiring manager, I want to inspect the featured SoundCraft EQ project card, switch between real Chrome Web Store screenshots, read the bilingual description, and observe the maintenance status badge, so that I understand the project's scale and engineering rigor.
4. As a reader sensitive to bright glare, I want the Light Mode button gradients and text contrast to remain calm and accessible without harsh white-on-light artifacts, so that I can read comfortably in bright environments.
5. As a developer browsing late at night, I want the Dark Mode theme to provide deep contrast and consistent slate tones across all cards and code blocks, so that the browsing experience is effortless.
6. As a blog reader, I want the blog index to display clear article cards with reading times, tags, and AI badges, so that I can easily discover relevant engineering content.
7. As a blog reader searching for specific topics, I want tag filters to instantly narrow down the article list, and I want an informative empty state message when no articles match, so that I understand the filter outcome.
8. As a technical reader on an article page, I want code snippets to be syntax-highlighted, markdown headings to be well-structured, and the TOC sidebar items to smoothly scroll to corresponding sections, so that I can navigate long technical deep-dives efficiently.
9. As a search engine bot or social media crawler, I want HTML documents rendered directly by Edge SSR with complete `<title>`, OpenGraph, and Twitter Card tags, so that articles are previewed accurately on social feeds.
10. As a security auditor, I want the browser Developer Console to report zero Content Security Policy (CSP) violations or stylesheet parsing errors, so that defensive headers protect the site without breaking legit edge-rendered features.
11. As a security auditor, I want attempting to embed the site within an iframe on another domain to be rejected immediately by the browser due to `X-Frame-Options: DENY`, so that clickjacking attacks are provably impossible.
12. As a legitimate administrator who mistypes a password, I want the login page to clearly indicate authentication failure up to 5 times without locking me out prematurely.
13. As an attacker or scripted bot attempting a brute-force dictionary attack, I want the 6th consecutive failed attempt to be blocked immediately with a clear HTTP 429 Too Many Requests screen, so that automated password guessing is halted.
14. As an authenticated administrator using `test_admin`, I want a successful login to issue a secure `admin_session` cookie, redirect me cleanly to `/admin`, and allow me to create and edit articles without friction.
15. As a project stakeholder, I want an interactive visual report containing desktop and mobile screenshots of all critical pages, so that I can visually sign off on the design and functional quality.

---

## Implementation Decisions

- **Test Seam Architecture (Highest Edge Seam)**:
  - All browser testing executes exclusively against the running edge server on `http://localhost:8787`.
  - The edge server runs standard production assets compiled into `./public` via Tailwind CSS v4 and standard edge routing in `src/index.tsx`.
  - Zero internal code hooks or test-only bypass routes are added to `src/`; the browser driver interacts strictly through external HTTP requests, mouse clicks, and keyboard strokes.
- **Dual Viewport Standard**:
  - **Desktop Viewport**: 1440 × 900 px, device scale factor 1.
  - **Mobile Viewport**: 390 × 844 px, touch enabled, device scale factor 3 (iPhone 14/15 standard).
- **Core User Journey Matrix**:
  1. **Journey 1: Public Portfolio & SoundCraft EQ Showcase**:
     - Route: `GET /`
     - Desktop & Mobile captures.
     - Dark Mode capture vs Light Mode capture.
     - SoundCraft EQ screenshot carousel / thumbnail switching capture.
     - Pulsing badge capture.
  2. **Journey 2: Technical Blog & Article Reader Edge SSR**:
     - Routes: `GET /blog`, `GET /blog?tag=Cloudflare`, `GET /blog/:slug`.
     - Article list rendering, tag filter state, and empty filter state.
     - Single article page: TOC smooth scrolling execution and screenshot.
     - Head inspection: Verify `<title>`, `meta[property="og:title"]`, `meta[name="twitter:card"]`.
  3. **Journey 3: Admin Life Cycle & Rate Limiting (429)**:
     - Route: `GET /admin/login`.
     - Execution of 5 consecutive bad login form submissions.
     - 6th attempt submission: assert HTTP 429 status and capture rate-limited error screen.
     - Successful login via `test_admin` and `test_password_123`: assert HTTP 302 and redirect to `/admin`.
     - Admin dashboard overview capture.
  4. **Journey 4: Browser Security & Console Diagnostics**:
     - Monitor browser Console message events: assert 0 CSP violation errors, 0 mixed content errors.
     - Test clickjacking defense: attempt to load `/` inside an `<iframe>` and assert browser refusal.
- **Reporting & Persistence**:
  - Captured screenshots are stored in `.system_generated` / artifact directory for interactive rendering.
  - A permanent summary report is written to `docs/test-reports/browser-testing-report.md`.

---

## Testing Decisions

- **What makes a good browser E2E test**:
  - Tests external visible behavior and user-perceivable state only (DOM visibility, computed contrast, network status, console errors), never internal private variables.
  - Verifies both happy paths and failure defenses (429 rate limit, empty blog states).
  - Validates visual fidelity across both Desktop and Mobile viewport boundaries.
- **Modules to be tested**:
  - Edge SSR components (LandingPage, BlogIndexPage, ArticleReaderPage, AdminLoginPage, AdminDashboardPage).
  - Client-side scripts (Theme toggle, I18n switcher, TOC smooth scroll).
  - Edge security middleware (`secureHeaders`, `loginRateLimiter`).
- **Prior Art**:
  - Complements the existing backend unit suite in `tests/security.test.ts`, `tests/admin.test.ts`, and `tests/blog.test.ts` by adding visual and DOM-level verification.

---

## Out of Scope

- Setting up third-party cloud testing grids (SauceLabs, BrowserStack). Local Chromium / Playwright driver provides full fidelity.
- Synthetic network bandwidth throttling (e.g. 2G/3G slow network emulation), since edge assets are served locally from memory or CDN.
- Multi-user concurrent session stress testing.

---

## Further Notes

- The local Wrangler development server runs via `npm run dev` (`wrangler dev`).
- D1 database migrations should be verified locally prior to running admin write tests via `wrangler d1 migrations apply DB --local`.
