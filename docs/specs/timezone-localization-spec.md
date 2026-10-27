# Spec: 全站時間時區本地化 (Edge SSR Timezone Localization to Asia/Taipei)

## Problem Statement

目前 Cloudflare D1 資料庫遵循 SQLite 預設標準，使用 `CURRENT_TIMESTAMP` 記錄所有文章與修訂歷史的時間戳記（為 UTC+0 世界協調時間）。由於邊緣端 SSR 渲染層在輸出 HTML 時直接印出資料庫內的原始字串（例如 `2026-10-27 05:00:19`），在台灣時區（UTC+8 台北時間，下午 13:00）瀏覽文章歷史紀錄、文章發布時間與後台列表時，畫面時間比當地實際時間少 8 個小時。這對讀者造成閱讀混淆，並對管理者在追蹤修訂紀錄與排程發布時造成時間判讀上的不便。

## Solution

建立邊緣原生時區格式化機制。維持資料庫持久層儲存標準中立的 UTC+0 時間戳記不變，在邊緣 SSR 渲染層將面向使用者的時間統一轉換為台灣/台北時區（UTC+8, Asia/Taipei），以符合讀者直覺。同時，在 HTML 語意標籤 `<time dateTime="...">` 與 SEO 結構化資料中輸出包含正確時區偏移量（`+08:00`）的標準 ISO-8601 時間字串，兼顧使用者體驗與搜尋引擎最佳化。

## User Stories

1. As a blog reader in Taiwan (UTC+8), I want to see article revision timestamps in local Taipei time, so that I can accurately understand when changes and updates occurred without doing mental math to add 8 hours.
2. As a blog reader, I want the initial publication date on the article reader page to reflect the local calendar date and time in Taipei, so that articles published late at night do not appear as published on the previous day.
3. As a visitor browsing the blog index (/blog), I want article summary cards to display publication dates in local Taipei date format, so that the chronological timeline matches my expectation.
4. As a content administrator, I want to see the revision history on the article view reflect Taipei local time, so that I can easily cross-reference my working schedule and edit notes.
5. As a content administrator viewing the admin dashboard (/admin), I want the post list table to display creation and update dates in Taipei time, so that managing content releases feels natural and accurate.
6. As a content administrator editing a post (/admin/posts/edit/:slug), I want the post creation timestamp badge to show the local Taipei time, so that I have clear context on the post lifecycle.
7. As a search engine web crawler, I want `<time dateTime="...">` attributes and JSON-LD structured data to include explicit timezone offsets (+08:00 or ISO-8601 with offset), so that article freshness is indexed accurately across global search results.
8. As a frontend accessibility user relying on screen readers, I want semantically accurate time elements in readable local formats, so that synthesized speech communicates the correct local date and time.
9. As a software developer maintaining the codebase, I want database timestamps to remain standard UTC+0, so that data migrations, queries, and multi-region synchronizations remain clean, neutral, and standard-compliant.
10. As a software developer, I want a single centralized date-formatting utility module, so that any new pages or components automatically share identical timezone formatting logic without code duplication.

## Implementation Decisions

- **Preserve UTC+0 in Data Tier**:
  - The Cloudflare D1 SQLite database schema and migration definitions will remain unchanged. `CURRENT_TIMESTAMP` (UTC+0) will continue to be the source of truth for all `created_at` and `updated_at` records.
- **SSR Edge Formatting Layer**:
  - Implement a dedicated date transformation module in the shared library layer.
  - The module must provide pure, deterministic formatting functions capable of converting SQLite UTC strings (`YYYY-MM-DD HH:MM:SS` or ISO formats) into Asia/Taipei (UTC+8) representations.
  - Required output formats:
    - Full datetime display: `YYYY-MM-DD HH:mm:ss` (for revision history and audit trails).
    - Date-only display: `YYYY-MM-DD` (for article cards and reader header).
    - Semantic ISO-8601: `YYYY-MM-DDTHH:mm:ss+08:00` (for machine-readable HTML `<time>` tags and JSON-LD schema).
- **Edge Runtime Compatibility**:
  - Use native V8 / Edge runtime primitives (`Intl.DateTimeFormat` configured with `timeZone: "Asia/Taipei"` and `Date` manipulation), avoiding external heavy date libraries (e.g. Moment.js, date-fns) to maintain zero-dependency edge performance.
- **Component Localization Touchpoints**:
  - Article Reader view: format revision history timeline and main header publication date.
  - Blog Index view: format article card publication dates.
  - Admin Dashboard view: format post management table dates.
  - Admin Editor view: format post creation header info.

## Testing Decisions

- **What makes a good test**:
  - Tests must assert external behavior and output fidelity rather than internal implementation details.
  - Timezone parsing must be validated against critical time boundaries:
    - Normal daytime conversions.
    - Day boundary crossings (e.g. UTC 20:00 converting to next-day Taipei 04:00).
    - Month boundary crossings (e.g. last day of month at UTC 22:00 crossing into next month).
    - Year boundary crossings (e.g. Dec 31 UTC 20:00 crossing into Jan 1 Taipei).
    - Leap year transitions (Feb 28/29).
  - Component / Route tests must assert that rendered HTML output strings contain the expected Taipei time instead of the raw UTC string.
- **Modules to be tested**:
  - Shared date utility module.
  - Blog reader page SSR integration (verifying revision list and `<time>` tags).
- **Prior art**:
  - Existing route tests in `tests/blog.test.ts`, `tests/article.test.ts`, and `tests/admin.test.ts` where HTML responses from synthetic requests are asserted.

## Out of Scope

- Client-side dynamic timezone selector (e.g. allowing readers to manually pick America/New_York or Europe/London). The site targets Traditional Chinese technical readers, with Asia/Taipei as the canonical local timezone.
- Client-side hydration scripts for time formatting. All transformations must be rendered on the Edge via Hono Edge SSR.
- Altering existing historical database records or D1 schema column types.

## Further Notes

- The edge-native nature of Cloudflare Workers isolates execution per request, ensuring that timezone formatting incurs negligible compute cost while guaranteeing zero layout shift (CLS) for end users.
