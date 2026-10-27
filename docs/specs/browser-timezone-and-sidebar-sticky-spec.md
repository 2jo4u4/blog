# Spec: 瀏覽器本地時區增強與側邊欄黏性排版修復 (Browser Timezone Localization & Sidebar Sticky Collision Fix)

## Problem Statement

目前文章閱讀頁面存在兩項影響閱讀與資訊判讀的使用者體驗問題：

1. **側邊欄卡片滾動重疊碰撞**：在文章閱讀頁面中，只有「目錄卡片（Table of Contents）」單獨設置了滾動黏性（Sticky），而緊隨其後的「文章歷史紀錄」與「作者資訊卡片」則是一般靜態文件流元素。當讀者向下滾動長文時，下方的歷史紀錄與作者卡片會持續向上推進，直接重疊並覆蓋在停駐於頂部的目錄文字上方，造成嚴重的文字重疊與不可讀現象。
2. **時區固定無法符合全球不同訪客設備**：目前伺服器端 SSR 輸出固定單一的特定時區時間（如台北時間 UTC+8）。當來自不同國家與時區的技術讀者或開發者（例如東京 UTC+9、倫敦 UTC+0、舊金山 UTC-7）閱讀文章或檢視修訂紀錄時，時間戳記無法反映讀者設備本機的實際時間，需要讀者自行手動換算時差。

## Solution

1. **統一側邊欄黏性容器架構**：重構側邊欄佈局結構，移除個別子卡片上的獨立黏性設定，改由側邊欄最外層包裹容器統一承載黏性（Sticky）定位與最大高度視窗限制（包含內部平滑滾動）。目錄、歷史紀錄與作者卡片維持天然的垂直文件流關係，確保滾動時整組側邊欄平滑隨螢幕停駐，徹底根除卡片互相擠壓與覆蓋的渲染缺陷。
2. **客戶端瀏覽器時區漸進增強（Progressive Enhancement）**：
   - 伺服器端（SSR）在渲染 HTML 時，為所有時間標籤標註標準機器可讀的 ISO-8601 時間戳記（`dateTime`）以及格式化標籤屬性（`data-local-format="date"` 或 `data-local-format="datetime"`），維持最優異的 SEO 結構化資料與無 JS 降級能力。
   - 注入極簡原生漸進增強腳本，在網頁載入時自動讀取用戶瀏覽器當前設定的時區，將時間就地轉換為用戶當地的 24 小時等寬格式（`YYYY-MM-DD HH:mm:ss` 或 `YYYY-MM-DD`），無縫兼顧全球訪客的在地化直覺與毫秒級首屏體驗。

## User Stories

1. As a reader scrolling through a long technical article, I want the sidebar table of contents, revision history, and author cards to stay neatly in their proper layout without colliding, so that I can easily navigate the article and read update logs at any point.
2. As a reader on a smaller desktop or laptop screen, I want the sticky sidebar to scroll independently if its total height exceeds my viewport, so that content at the bottom of the sidebar is never permanently cut off.
3. As a technical reader located outside the UTC+8 timezone (e.g. in Japan, Europe, or the Americas), I want the article publication and revision timestamps to automatically display in my browser's local timezone, so that I immediately understand when the article was created or updated without mental conversion.
4. As a reader in Taiwan or the Asia/Taipei timezone, I want the timestamps to match my local time, so that the reading experience remains completely accurate and familiar.
5. As a content administrator reviewing published posts across different client devices, I want the revision history timestamps to reflect the current device's local clock, so that audit logs align with local activity logs.
6. As a search engine crawler (such as Googlebot), I want the HTML source code to contain standard ISO-8601 `<time dateTime="...">` attributes, so that search indexing and article freshness algorithms accurately parse publication dates regardless of client-side scripts.
7. As a privacy-conscious user browsing with JavaScript disabled, I want the server-rendered fallback timestamps to display valid, meaningful date information, so that the page remains 100% accessible and readable.
8. As a reader, I want localized timestamps to follow a consistent 24-hour monospace technical style (YYYY-MM-DD HH:mm:ss), so that the typography matches the clean terminal design system of the blog without irregular locale-dependent slashes or AM/PM text.
9. As a developer maintaining the edge codebase, I want client-side timezone enhancement to be lightweight and zero-dependency, so that page load times and edge worker asset sizes remain virtually unchanged.
10. As a developer, I want a single unified time attribute convention (e.g. `data-local-format`) across all views, so that any new pages with time elements are automatically enhanced without writing repetitive scripts.

## Implementation Decisions

- **Sidebar Unified Sticky Layout**:
  - Remove individual sticky positioning from the Table of Contents card component.
  - Apply sticky positioning exclusively to the parent sidebar wrapper within the main article grid layout.
  - The sticky wrapper must have an appropriate top offset aligned with the navbar height, a maximum height bounded by the viewport height, and vertical auto-overflow with custom subtle scrollbars.
  - The Table of Contents, Revision History, and Author cards must remain vertical siblings inside this single sticky container, preserving natural padding, gap, and stacking contexts.
- **Client-Side Progressive Timezone Enhancement**:
  - Keep the server-side date utility responsible for emitting canonical ISO-8601 strings into the `dateTime` attribute of all `<time>` tags.
  - Tag every display `<time>` element with a declarative attribute indicating the target formatting granularity:
    - Date only: `data-local-format="date"`
    - Full date and time: `data-local-format="datetime"`
  - Embed an inline, zero-dependency, self-executing script into the root document layout that executes on DOM readiness:
    - Queries all `<time[dateTime][data-local-format]>` elements.
    - Parses the ISO `dateTime` value into a standard JavaScript `Date` instance.
    - Utilizes the browser's native `Intl.DateTimeFormat` with the user's default locale/timezone and 24-hour cycle to format the date into clean hyphen-separated strings (`YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`).
    - Updates `textContent` in place, wrapped in a safe try-catch to ensure complete fail-safe execution.
- **SSR Server Default Fallback**:
  - The inner text content rendered by SSR before client script execution will remain the server-computed date string (Asia/Taipei), guaranteeing zero visual layout shift (CLS) for the primary audience and full content availability for crawlers.

## Testing Decisions

- **What makes a good test**:
  - Tests should verify external HTML structure and semantic contracts, not internal component styling tokens.
  - The sidebar layout test must assert that the parent wrapper carries the sticky and overflow constraints while child cards do not carry conflicting sticky positioning.
  - The time formatting test must verify that rendered HTML elements across article reader, blog index, and admin views carry both valid ISO `dateTime` attributes and the appropriate `data-local-format` markers.
  - The client enhancement script must be tested for syntax correctness and deterministic formatting behavior.
- **Modules to be tested**:
  - Article Reader view integration (verifying sticky sidebar container structure and revision timestamp attributes).
  - Blog Index view integration (verifying article card time attributes).
  - Root Layout view integration (verifying inclusion of the client progressive enhancement script).
- **Prior art**:
  - Existing integration tests in `tests/article.test.ts` and `tests/blog.test.ts` where full response HTML from synthetic requests is asserted via Vitest.

## Out of Scope

- Introducing heavyweight third-party frontend frameworks or client-side runtime hydration layers (preserving zero-JS edge architecture).
- Storing client timezones in cookies or backend user preferences.
- Modifying SQLite database schemas or altering UTC storage in Cloudflare D1.

## Further Notes

- The combination of SSR fallback with lightweight client progressive enhancement ensures the website achieves a perfect 100 on Google Lighthouse performance and SEO audits while providing a tailored local experience for every user worldwide.
