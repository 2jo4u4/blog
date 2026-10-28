# 全站瀏覽器端對端驗證與視覺回歸驗收報告 (Full-Site Browser E2E Verification Report)

- **測試日期**：2026-10-28
- **測試環境**：Cloudflare Workers 本地邊緣環境 (`wrangler dev` on `http://127.0.0.1:8787`)
- **測試引擎**：Chromium / Microsoft Edge (Headless, Playwright 1.64.1)
- **測試覆蓋視口**：
  - **Desktop**：1440 × 900（標準寬螢幕）
  - **Mobile**：390 × 844（iPhone 14/15 智慧型手機視口，DeviceScaleFactor: 3）
- **總體驗證狀態**：✅ **4/4 核心旅程全部通過（20 個關鍵節點截圖存證）**

---

## 1. 測試結果總覽 (Executive Summary)

| 旅程編號 | 測試旅程 | 關鍵檢驗項目 | 狀態 | 截圖存證 |
| :--- | :--- | :--- | :---: | :--- |
| **Journey 1** | 公開首頁與 SoundCraft EQ 展示 | • Desktop 深色主題首頁佈局<br>• 淺色主題切換與對比度無眩光<br>• 中英雙語語言切換（ZH <-> EN）<br>• SoundCraft EQ 商店截圖與懸停預覽<br>• 維護審核徽章脈衝動態<br>• Mobile 視口單欄排版與抽屜選單 | ✅ PASSED | `01_desktop_landing_dark.png`<br>`02_desktop_landing_light.png`<br>`02b_desktop_landing_en.png`<br>`03_soundcraft_eq_showcase.png`<br>`03b_soundcraft_inpage_picker.png`<br>`04_mobile_landing_dark.png`<br>`05_mobile_drawer_menu.png`<br>`06_mobile_soundcraft_eq.png` |
| **Journey 2** | 部落格與 Edge SSR 閱讀體驗 | • 文章列表卡片與標籤篩選<br>• 標籤篩選空狀態（Explicit Empty State）<br>• 單篇文章 Edge SSR 渲染與代碼高亮<br>• TOC 側邊欄錨點平滑跳轉<br>• Mobile 文章閱讀排版與 SEO 元資料 | ✅ PASSED | `07_desktop_blog_index.png`<br>`08_desktop_blog_tag_filter.png`<br>`09_desktop_blog_empty_state.png`<br>`10_desktop_article_reader.png`<br>`11_desktop_article_toc_scrolled.png`<br>`12_mobile_article_reader.png` |
| **Journey 3** | 管理員安全生命週期與速率限制 | • 登入頁表單渲染<br>• 連續 5 次錯誤登入觸發 401<br>• 第 6 次錯誤登入觸發 **HTTP 429 Too Many Requests** 視覺頁面<br>• `test_admin` 成功登入與發布後台<br>• 文章建立表單填寫與發布生命週期 | ✅ PASSED | `13_desktop_admin_login.png`<br>`14_admin_login_rate_limited_429.png`<br>`15_desktop_admin_dashboard.png`<br>`15b_admin_post_form.png`<br>`15c_admin_dashboard_updated.png` |
| **Journey 4** | 瀏覽器端安全防禦與 Console 診斷 | • 監聽所有導航與互動 Console 事件（**零 CSP 違規報錯**）<br>• 點擊劫持 iframe 嵌入測試（`X-Frame-Options: DENY` 強制阻擋） | ✅ PASSED | `16_clickjacking_iframe_blocked.png` |

---

## 2. 各旅程詳細驗證紀錄

### Journey 1: 公開首頁與 SoundCraft EQ 展示
1. **Desktop 首頁（1440 × 900）**：
   - Hero 區塊、個人簡介、經歷時間軸、技能網格於深色主題下皆清晰對比渲染。
2. **主題切換（Light Mode）**：
   - 點擊 `#theme-toggle-btn` 後，`<html>` 標籤即時切換為 `light`，樣式變數隨之平滑過渡。先前調整的漸層按鈕（Cyberpunk 綠藍紫）在淺色底色下文字對比清晰，無反光眩光問題。
3. **中英雙語切換（Bilingual i18n Toggle）**：
   - 點擊 `#lang-toggle-btn`，頁面立即更新語言參數重導向至英文介面，標題更新為 `Jay | Frontend Engineer`，再次點擊平滑切換回中文。
4. **SoundCraft EQ 全寬 Showcase**：
   - 專案標題 `SoundCraft EQ - 專業音訊調音等化器` 正確居中展示。
   - 雙重真實商店截圖（主等化器介面與頁內媒體拾取覆蓋層）以 `1280x800` 高解析比例呈現，且次要圖層支援懸停效果。
   - 維護審核徽章 `● v1.0 架構重構・新版維護審核中` 與琥珀色脈衝動畫（`animate-pulse`）正常運行。
5. **Mobile 響應式佈局（390 × 844）**：
   - 頁面水平滾動條為 0，無寬度溢出問題。
   - 點擊 `#mobile-menu-open-btn` 正常展開抽屜導航，點擊關閉按鈕正常還原。

---

### Journey 2: 部落格與 Edge SSR 閱讀體驗
1. **文章索引與標籤篩選**：
   - 文章卡片、預估閱讀時間、AI 摘要徽章正常顯示。
   - 導航至 `?tag=Cloudflare` 時，僅呈現關聯文章。
2. **無文章空狀態（Explicit Empty State）**：
   - 訪問不存在標籤 `?tag=NonExistentTagXYZ`，頁面清晰呈現 `尚無相關文章` 與提示說明 `標籤 #NonExistentTagXYZ 下目前沒有已發布的文章。`，並提供「查看全部文章」快捷連結。
3. **單篇閱讀頁 Edge SSR 與 SEO**：
   - Markdown 標題、清單、表格與語法高亮代碼區塊由邊緣直出渲染完成。
   - SEO 檢驗：
     - `<title>`：`從 Next.js 遷移至 Cloudflare Workers + Hono Edge SSR + D1 的極速架構實踐 | 黃冠傑 (Jay) Blog`
     - `meta[property="og:title"]`：內容正確。
     - `meta[name="twitter:card"]`：`summary_large_image`。
4. **TOC 側邊欄跳轉**：
   - 點擊目錄錨點 `#為什麼需要邊緣原生-edge-native`，頁面平滑滾動至目標段落，無 JavaScript 執行異常。

---

### Journey 3: 管理員安全生命週期與速率限制 (429)
1. **暴力破解防禦（Sliding-Window Rate Limiting）**：
   - 由攻擊者 IP（`192.0.2.x`）發起連續 5 次錯誤密碼提交，伺服器依次回傳 HTTP 401 拒絕。
   - 第 6 次提交錯誤密碼時，短路攔截機制觸發，伺服器回傳 **HTTP 429 Too Many Requests**。
   - 瀏覽器畫面清晰顯示：`嘗試登入失敗次數過多，請稍後再試 (Too many failed login attempts)。`。
2. **正常管理員登入**：
   - 由合法 IP 使用 `test_admin` 與 `test_password_123` 提交，驗證通過後取得 `admin_session` Cookie 並於 302 重導向後成功進入 `/admin` 管理主頁。
3. **文章建立與發布生命週期（Article Publishing Lifecycle）**：
   - 點擊進入 `/admin/editor` 編輯頁，填入文章標題、自訂 Slug、摘要、Markdown 正文與標籤後提交。
   - 伺服器成功將文章存入 D1 資料庫並重導向回管理員儀表板，新文章即時顯示於文章管理清單中。

---

### Journey 4: 瀏覽器端安全防禦與 Console 診斷
1. **CSP 零違規（Zero CSP Violations）**：
   - 全程監聽 `console.error` 與安全事件，未記錄到任何 Content Security Policy 違規阻擋紀錄，證明內嵌時區與主題腳本與邊緣 CSP 政策完全相容。
2. **點擊劫持防禦（Clickjacking Defense）**：
   - 透過測試頁面的 `<iframe>` 嘗試嵌入 `${BASE_URL}/`，瀏覽器主動依據 `X-Frame-Options: DENY` 拒絕呈現：
     `Refused to display 'http://127.0.0.1:8787/' in a frame because it set 'X-Frame-Options' to 'deny'.`

---

## 3. 測試腳本與自動化維護

本驗證流程已固化於自動化腳本中：
- 測試腳本：[`scripts/e2e-browser-verification.mjs`](file:///d:/project/cv/scripts/e2e-browser-verification.mjs)
- 執行方式：
  ```powershell
  # 1. 建置樣式與啟動本地邊緣伺服器
  npm.cmd run build:css
  npx.cmd wrangler dev --port 8787

  # 2. 執行瀏覽器端對端驗收
  node.exe scripts/e2e-browser-verification.mjs
  ```
- 截圖歸檔目錄：[`docs/test-reports/screenshots/`](file:///d:/project/cv/docs/test-reports/screenshots/)
