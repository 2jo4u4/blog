# UI/UX 設計規範與 RWD 響應式架構指南 (Design System & RWD Spec)

本文件定義 Jay Huang 個人專案成就網站的視覺語彙、色彩規範、排版佈局、RWD 斷點行為與微動效設計。

---

## 1. 視覺基調與色彩系統 (Color Palette)

採用 **「現代工程師暗色極簡風（Engineering Dark Mode）」** 為預設基調，並支援明暗主題切換（Dark/Light Mode）。

### 1.1 色彩變數定義 (Tokens)
| 角色 | 暗色模式 (Dark, Default) | 淺色模式 (Light) | 用途 |
| :--- | :--- | :--- | :--- |
| **Background (主背景)** | `#0B0F19` (極深冷灰黑) | `#F8FAFC` (Slate-50) | 全域背景 |
| **Surface (卡片/容器底色)** | `#111827` (Gray-900 / 半透明毛玻璃) | `#FFFFFF` (純白) | Bento 卡片、終端機面板 |
| **Surface Hover** | `#1F2937` (Gray-800) | `#F1F5F9` (Slate-100) | 卡片懸停高亮 |
| **Border (邊框)** | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | 極細邊框線條 (1px) |
| **Accent Primary (主強調色)** | `#06B6D4` (Cyan-500) 或 `#38BDF8` (Sky-400) | `#0284C7` (Sky-600) | 關鍵按鈕、高亮標籤、外連箭頭 |
| **Accent Secondary (副強調色)**| `#10B981` (Emerald-500) | `#059669` (Emerald-600) | 量化指標高亮、成就數字 |
| **Text Primary (主要文字)** | `#F9FAFB` (Gray-50) | `#0F172A` (Slate-900) | 大標題、內文重點 |
| **Text Secondary (次要文字)** | `#9CA3AF` (Gray-400) | `#64748B` (Slate-500) | 輔助說明、次標題、時間標籤 |

---

## 2. 佈局與斷點策略 (Responsive Layout & Breakpoints)

遵循 **Mobile-First** 原則，定義 3 個主要斷點：
- **Mobile (`< 768px`)**：單欄垂直流、滿版邊距（Padding 16px ~ 20px）、抽屜漢堡選單。
- **Tablet (`768px ~ 1023px`)**：2 欄網格、中等字級調整、展開平板選單或抽屜選單。
- **Desktop (`>= 1024px`)**：雙欄 Hero、Bento Grid 不對稱佈局、最大容器寬度 `max-w-6xl` (1152px) 置中。

---

## 3. 各大區塊 (Sections) UI/UX 與 RWD 細部規格

### 3.1 導覽列 (Header / Navigation)
- **視覺**：固定置頂 (`sticky top-0 z-50`)，帶毛玻璃效果 (`backdrop-blur-md bg-opacity-80`)。
- **左側**：個人品牌標識 `> jay.huang`（具備打字機游標微閃爍）。
- **桌面端**：水平展開 5 大錨點導航（關於、專案、成就指標、職涯、聯絡）+ 主題切換按鈕 + GitHub 外連。
- **行動端**：右側漢堡圖示 (Hamburger Icon)，點擊觸發**平滑滑出抽屜 (Slide-over Drawer)**，點擊任一項目後平滑滾動並自動關閉。

### 3.2 Hero 區塊：終端機互動控制台 (Interactive Terminal Bento Hero)
- **排版**：
  - *桌面端*：左側強標題與 CTA，右側擬態 Terminal 控制台視窗。
  - *行動端*：縱向排列，上為大標與個人簡介，下為 Terminal 卡片。
- **Terminal UI 設計**：
  - 仿 macOS / Linux 終端機，頂部有三色圓點（紅/黃/綠）。
  - 自動依序打字輸出：
    ```bash
    > jay.currentFocus = "Frontend Architecture & Web Performance";
    > jay.location = "Taipei, Taiwan";
    > jay.status = "Open to Senior Opportunities";
    ```
  - 底下提供一個乾淨的指令互動或快速按鈕區（`Explore Projects 🚀`、`Get in Touch ✉️`）。

### 3.3 量化指標列 (Key Metrics Grid)
- **排版**：
  - *桌面端*：4 欄橫向展開 (`grid grid-cols-4 gap-4`)。
  - *平板端*：2 欄 2 列 (`grid-cols-2`)。
  - *行動端*：2 欄緊湊並排或單欄卡片。
- **卡片細節**：
  - 核心數字放大加粗（如 `2m → <10s`、`>1MB → <100KB`），搭配 Emerald 漸層色或發光微特效。

### 3.4 專案成就區：便當盒網格 (Bento Grid Projects)
- **排版策略**：
  - **Item 1: Optoma Whiteboard (Creative Board)** ➔ 跨 2 欄主打大卡片 (Col-Span 2)。
    - 左/上半部：即時白板截圖與互動預覽。
    - 右/下半部：Canvas 原生 OOP 架構、WebSocket 即時協同、4 人團隊領導說明，附「線上體驗 ↗」按鈕。
  - **Item 2: 基礎設施與效能調優 (Infra & Performance)** ➔ 跨 2 欄主打大卡片 (Col-Span 2)。
    - 視覺呈現：終端機 / 架構流程圖示意 (Docker 2m->10s, Bundle 1MB->100KB, Monorepo)。
  - **Item 3: Web Audio 等化器** ➔ 標準單卡片 (Col-Span 1)。
    - Firefox 擴充套件截圖、AudioContext 濾波節點說明、Firefox 商店連結。
  - **Item 4: 菜霸子蔬果電商雙端系統** ➔ 標準單卡片 (Col-Span 1)。
    - 前後台整合、MUI 權限後台、Axios 攔截器架構。
- **行動端 RWD**：
  - 於行動裝置上全部重排為流暢的單欄 (`col-span-1`) 垂直卡片，主打卡片以「Featured」標籤標示。

### 3.5 職涯歷程：智慧垂直時間軸 (Progressive Timeline)
- **排版**：
  - 左側細條漸層線與時間軸圓點，右側依序放置 5 段經歷。
  - 近期兩段資深經歷（2024~2026 最近公司、2022~2023 奧圖碼）預設完整展開，展示重點成就 Bullet Points 與技術標籤。
  - 早期三段經歷保持緊湊結構，避免版面冗長，兼顧閱讀節奏。
- **行動端 RWD**：
  - 縮排間距調整，保證小螢幕手機上依然有足夠的字距與行距。

### 3.6 聯絡區與頁尾 (Contact & Footer)
- **UI**：乾淨的大字邀請「Let's Build Something Great Together」。
- **包含**：
  - 一鍵複製 Email 提示或直接 `mailto:` 點擊。
  - GitHub、LinkedIn、CakeResume 一字排開的大按鈕。
  - 版權聲明：`© 2026 Jay Huang. Built with React & Tailwind CSS.`

---

## 4. 動效與互動手感 (Micro-interactions & UX Polish)

1. **滾動進場 (Scroll Reveal)**：
   - 每個區塊在進入視口 15% 時觸發淡入位移（`opacity 0 ➔ 1`, `translate-y-4 ➔ 0`），時長 300ms。
2. **卡片懸停 (Hover Micro-interactions)**：
   - 滑鼠懸停於 Bento 卡片時，邊框微發光 (`border-cyan-500/30`)，卡片微浮起 (`-translate-y-1`)。
3. **無障礙支援 (Accessibility)**：
   - 若使用者開啟 `@media (prefers-reduced-motion: reduce)`，自動關閉所有位移動畫，直接靜態渲染，確保最佳效能與無障礙體驗。
