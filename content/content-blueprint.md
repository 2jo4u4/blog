# 個人網站專案成就與資料準備總覽 (Data & Content Blueprint)

本文件整理自履歷 `黃冠傑resumes.pdf` 以及 `/grill-me` 深度對焦結果，作為個人介紹與專案成就網站的基礎內容標準。

---

## 1. 個人核心定位 (Hero & About)

- **姓名**：黃冠傑 (Jay Huang)
- **職稱**：資深前端 / Web 軟體工程師 (Senior Frontend / Web Engineer)
- **核心標語 (Elevator Pitch)**：
  > 專注於現代 Web 架構、前端工程化與極致效能調優的軟體工程師。
- **個人理念與簡介**：
  具備 5~6 年 Web 應用程式開發經驗，主力技術以 React 與 TypeScript 為核心。熱衷於底層技術實踐與工程架構設計：曾從 0 到 1 研發原生 HTML5 Canvas 物件導向即時協同白板，亦在生產環境中主導 Turborepo + Docker 部署流水線將交付時間縮短至 10 秒內、主打包檔體積壓縮至 100KB 以下。近期亦積極涉獵 AI Agent、LLM 工作流與 Tool Calling 應用，是一名重視工程本質與使用者體驗的 Builder。
- **地點**：台灣雙北 (Taipei / New Taipei, Taiwan)
- **社群與聯絡方式**：
  - **GitHub**: [github.com/2jo4u4](https://github.com/2jo4u4)
  - **LinkedIn**: [linkedin.com/in/huang-jay](https://www.linkedin.com/in/huang-jay)
  - **CakeResume**: [cake.me/me/HuangJay](https://www.cake.me/me/HuangJay)
  - **Email**: `2jo4u4@gmail.com`

---

## 2. 關鍵量化亮點 (Key Impact Metrics)

在首頁突顯的 4 項核心成效數據：
1. **部署速度提升**：舊專案完整部署時間從 **2 分鐘 ➔ < 10 秒**（Docker 容器化 + CI/CD 優化）。
2. **打包體積縮減**：主打包檔案大小由 **> 1MB ➔ < 100KB**，次級頁面僅數 KB（Code Splitting + 按需載入）。
3. **專業年資積累**：**5~6 年** 業界全職軟體開發歷練。
4. **架構領導與團隊協作**：帶領 **4 人前端團隊** 制定規範、主導 Code Review 與獨立 Library 模組化。

---

## 3. 專案成就庫 (Featured Projects)

### 專案一：Optoma Whiteboard (Creative Board) - 即時協同白板
- **類型**：商業核心產品（奧圖碼科技）
- **職責**：前端架構負責人 / 帶領 4 人團隊
- **技術棧**：`React`, `TypeScript`, `HTML5 Canvas`, `WebSocket`, `Webpack`, `SASS`, `CI/CD`
- **成果連結**：[Optoma Whiteboard 線上官網](https://whiteboard.optoma.com/)（需登入使用）
- **技術挑戰與成就**：
  1. **原生 Canvas 物件導向架構**：不依賴第三方重型繪圖函式庫，自研原生 Canvas 圖形引擎，定義圖形/文字/影音物件生命週期，並將白板引擎獨立抽成函式庫維護，具備移植 Electron 桌面端的高擴充性。
  2. **低延遲協同運作**：透過 WebSocket 實作多人即時筆跡同步與狀態管理。
  3. **團隊領導**：主導每週團隊 Code Review，統一代碼規範與架構設計。

---

### 專案二：前端工程基礎設施與極致效能調優 (Infrastructure & Performance)
- **類型**：公司內部核心基礎架構革新
- **職責**：架構與基礎設施主導者
- **技術棧**：`pnpm`, `Turborepo`, `Docker`, `CircleCI`, `GCP`, `Webpack`, `Verdaccio`
- **成果展示**：架構案例分析（Case Study）
- **技術挑戰與成就**：
  1. **Monorepo 整合**：導入 pnpm + Turborepo 統一多個子專案與共用模組，顯著縮減編譯時間並提升跨模組協作效率。
  2. **發布自動化與容器化**：透過 Docker 映像優化與 GCP/CircleCI 整合，將部署時間由 2 分鐘降至 10 秒以內。
  3. **極致載入效能調優**：導入程式碼分割 (Code Splitting)、動態載入與資源最小化，主打包縮至 100KB 內，次級頁面數 KB，達成首屏秒開。
  4. **內部 NPM 套件生態系**：架設 Verdaccio 私有 NPM Registry，支援 ESM/CommonJS 雙模組格式 (Dual-package) 發布，提升內部模組復用率。

---

### 專案三：網頁等化器 (Web Audio Equalizer)
- **類型**：個人 Side Project
- **職責**：獨立開發與維護
- **技術棧**：`React`, `TypeScript`, `Web Audio API`, `Webpack`, `Material UI`, `Firefox WebExtension`
- **成果連結**：[Firefox 擴充套件商店頁面](https://addons.mozilla.org/en-US/firefox/addon/euqalizer/)
- **技術挑戰與成就**：
  1. **底層 Audio 串流攔截**：透過 Web Audio API 的 `AudioContext` 與多組 `BiquadFilterNode` 串接網頁影音媒體，實現即時頻率增益調整。
  2. **客製化配置持久化**：支援自訂音頻預設檔與本機儲存記憶，搭配直覺的 MUI 調音介面。

---

### 專案四：菜霸子 (Vegeking) 蔬果電商前後台雙系統
- **類型**：商業雙端電商平台（博疄有限公司）
- **職責**：後台管理系統主導開發 / 前台購物車支援
- **技術棧**：`React`, `Material UI`, `Axios`, `SASS`, `CI/CD`, `RESTful API`
- **成果連結**：[菜霸子線上商城](https://www.vegeking.com.tw/?lang=zh-TW)
- **技術挑戰與成就**：
  1. **無 UI 設計師下的獨立後台建置**：運用 MUI 元件庫獨立搭建兼顧可用性與複雜業務的後台，涵蓋商品上下架、訂單進出貨與精細員工權限控管。
  2. **API 全域攔截器架構**：運用 Axios Interceptor 統一處理身份驗證、Token 刷新與錯誤彈窗回饋。

---

## 4. 職涯時間軸 (Work Experience)

| 期間 | 公司 | 職稱 | 核心專注事項 |
| :--- | :--- | :--- | :--- |
| **2024/8 ~ 2026/8** | 軟體及網路相關公司 | 軟體開發工程師 | Monorepo/Docker 基礎設施革新、打包效能調優、Verdaccio 私有套件、Electron 桌面程式與硬體串流整合 |
| **2022/3 ~ 2023/7** | 奧圖碼科技 (Optoma) | 網頁前端工程師 (Leader) | Creative Board 協同白板自研、Canvas OOP 引擎庫、WebSocket、帶領 4 人團隊與 Code Review |
| **2020/9 ~ 2022/2** | 博疄有限公司 | React 前端工程師 | 菜霸子蔬果電商後台管理平台 (MUI/權限/庫存) 與 B2C 前台支援、Axios 攔截器 |
| **2019/8 ~ 2020/7** | 凌發科技有限公司 | 前端工程師 | React Web 專案維護，獨立完成 React Native 行動端 App 與內部系統 |
| **2019/2 ~ 2019/6** | 陸豪科技有限公司 | 前端開發人員 | 前端基礎奠定 (HTML/CSS/JS/React)、官方形象網站開發與 Git 工作流 |

---

## 5. 學歷 (Education)

- **國立勤益科技大學 (NCUT)**
- 資訊工程系 四技學士畢業 (2015/9 ~ 2019/6)
