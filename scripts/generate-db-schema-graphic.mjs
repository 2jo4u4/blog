import { chromium } from "playwright";
import path from "path";

async function generate() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 800px;
      background: linear-gradient(145deg, #090d16 0%, #0f172a 50%, #0b1120 100%);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      color: #e2e8f0;
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
      overflow: hidden;
    }
    /* Subtle background grid */
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.4);
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.2px;
    }
    .meta {
      font-size: 11px;
      color: #64748b;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 20px;
      flex: 1;
    }

    /* Schema Tables */
    .schema-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      align-content: start;
    }

    .table-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .table-header {
      background: rgba(15, 23, 42, 0.9);
      padding: 7px 12px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .th-cyan { color: #38bdf8; border-left: 3px solid #06b6d4; }
    .th-emerald { color: #34d399; border-left: 3px solid #10b981; }
    .th-amber { color: #fbbf24; border-left: 3px solid #f59e0b; }
    .th-purple { color: #c084fc; border-left: 3px solid #a855f7; }
    .th-rose { color: #fb7185; border-left: 3px solid #f43f5e; }

    .table-body {
      padding: 8px 12px;
      font-size: 10.5px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .field-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #cbd5e1;
    }
    .pk { color: #fbbf24; font-size: 9px; font-weight: 700; margin-right: 4px; }
    .fk { color: #38bdf8; font-size: 9px; font-weight: 700; margin-right: 4px; }
    .datatype { color: #64748b; font-size: 9.5px; }

    /* SQL Terminal Panel */
    .terminal-panel {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .code-card {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .code-header {
      background: #090e1a;
      padding: 8px 14px;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .dots {
      display: flex;
      gap: 5px;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .code-body {
      padding: 12px 14px;
      font-size: 11px;
      line-height: 1.55;
      color: #e2e8f0;
      flex: 1;
    }
    .kw { color: #f43f5e; font-weight: 700; }
    .fn { color: #38bdf8; font-weight: 600; }
    .str { color: #34d399; }
    .alias { color: #fbbf24; }
    .comment { color: #64748b; font-style: italic; }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      font-size: 10px;
      color: #94a3b8;
    }
    .tag-pill {
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 8px;
      border-radius: 4px;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <span class="badge">3NF RELATIONAL SCHEMA</span>
      <h1 class="title">Retail Transaction & Omnichannel Invoicing Architecture</h1>
    </div>
    <div class="meta">Computer Science Foundation • Relational Modeling</div>
  </div>

  <div class="main-grid">
    <!-- Left: Normalized Tables -->
    <div class="schema-panel">
      <!-- Table 1: 購買通路 -->
      <div class="table-card">
        <div class="table-header th-cyan">
          <span>dbo.購買通路 (Stores)</span>
          <span class="datatype">4 columns</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span><span class="pk">PK</span>發票號碼</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span>隨機碼 (防偽)</span><span class="datatype">int(10)</span></div>
          <div class="field-row"><span>月份</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span>店家 (7-11, 全家, OK...)</span><span class="datatype">varchar(50)</span></div>
        </div>
      </div>

      <!-- Table 2: 訂貨主檔 -->
      <div class="table-card">
        <div class="table-header th-emerald">
          <span>dbo.訂貨主檔 (OrderMaster)</span>
          <span class="datatype">Composite PK</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span><span class="pk">PK</span><span class="fk">FK</span>發票號碼</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span><span class="pk">PK</span><span class="fk">FK</span>客戶編號</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span>訂貨月份</span><span class="datatype">varchar(50)</span></div>
        </div>
      </div>

      <!-- Table 3: 訂單明細 -->
      <div class="table-card" style="grid-column: span 2;">
        <div class="table-header th-amber">
          <span>dbo.訂單明細 (OrderLineItems)</span>
          <span class="datatype">Composite PK (M:N Resolved)</span>
        </div>
        <div class="table-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div>
            <div class="field-row"><span><span class="pk">PK</span><span class="fk">FK</span>發票號碼</span><span class="datatype">varchar(50)</span></div>
            <div class="field-row"><span><span class="pk">PK</span><span class="fk">FK</span>產品編號</span><span class="datatype">varchar(50)</span></div>
          </div>
          <div>
            <div class="field-row"><span>數量</span><span class="datatype">float(10)</span></div>
            <div class="field-row"><span>折扣率</span><span class="datatype">decimal(3,2)</span></div>
          </div>
        </div>
      </div>

      <!-- Table 4: 產品型錄 -->
      <div class="table-card">
        <div class="table-header th-purple">
          <span>dbo.產品資料 (Products)</span>
          <span class="datatype">Catalog</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span><span class="pk">PK</span>產品編號</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span>產品名稱</span><span class="datatype">varchar(50)</span></div>
          <div class="field-row"><span>單價</span><span class="datatype">int(10)</span></div>
        </div>
      </div>

      <!-- Table 5: 客戶資料 (脫敏) -->
      <div class="table-card">
        <div class="table-header th-rose">
          <span>dbo.客戶資料 (Customers)</span>
          <span class="datatype">Sanitized Profile</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span><span class="pk">PK</span>客戶編號</span><span class="datatype">C001, C002...</span></div>
          <div class="field-row"><span>客戶名稱</span><span class="datatype">Customer_C001</span></div>
          <div class="field-row"><span>電話 (脫敏)</span><span class="datatype">0912-345-678</span></div>
        </div>
      </div>
    </div>

    <!-- Right: Advanced T-SQL Terminal -->
    <div class="terminal-panel">
      <!-- Query 1: Window Function -->
      <div class="code-card">
        <div class="code-header">
          <div class="dots"><div class="dot dot-red"></div><div class="dot dot-yellow"></div><div class="dot dot-green"></div></div>
          <span>window_functions.sql — Top Products by Channel</span>
        </div>
        <div class="code-body">
          <span class="comment">-- 視窗分區排名 (Window Function Analytic)</span><br>
          <span class="kw">SELECT</span> 店家, 產品編號, 產品, 銷售量,<br>
          &nbsp;&nbsp;<span class="fn">RANK</span>() <span class="kw">OVER</span> (<br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">PARTITION BY</span> 店家<br>
          &nbsp;&nbsp;&nbsp;&nbsp;<span class="kw">ORDER BY</span> 銷售量 <span class="kw">DESC</span><br>
          &nbsp;&nbsp;) <span class="kw">AS</span> <span class="alias">喜愛排名</span><br>
          <span class="kw">FROM</span> 各通路銷售量_View;<br>
          <br>
          <span class="comment">-- 篩選各通路銷售冠軍 (Rank #1)</span><br>
          <span class="kw">SELECT</span> * <span class="kw">FROM</span> RankedSales <span class="kw">WHERE</span> <span class="alias">喜愛排名</span> = 1;
        </div>
      </div>

      <!-- Query 2: Set Difference -->
      <div class="code-card">
        <div class="code-header">
          <div class="dots"><div class="dot dot-red"></div><div class="dot dot-yellow"></div><div class="dot dot-green"></div></div>
          <span>set_difference.sql — Non-Symmetric Cohort Preferences</span>
        </div>
        <div class="code-body">
          <span class="comment">-- 關聯式代數差集 (Set Difference: C001 - C002)</span><br>
          <span class="kw">SELECT</span> a.產品編號, a.產品<br>
          <span class="kw">FROM</span> vw_Customer_C001 a<br>
          <span class="kw">LEFT JOIN</span> vw_Customer_C002 b<br>
          &nbsp;&nbsp;<span class="kw">ON</span> a.產品編號 = b.產品編號<br>
          <span class="kw">WHERE</span> b.產品編號 <span class="kw">IS NULL</span>;
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <div style="display: flex; gap: 8px;">
      <span class="tag-pill">1NF: Atomic Attributes</span>
      <span class="tag-pill">2NF: No Partial Dependencies</span>
      <span class="tag-pill">3NF: No Transitive Dependencies</span>
    </div>
    <div style="color: #38bdf8; font-weight: 600;">
      ✓ Data Sanitized (Customer_C001 / Customer_C002) • Zero PII Leakage
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(500);

  const outputPath = path.resolve("public/images/projects/retail-db-schema.png");
  await page.screenshot({ path: outputPath });
  console.log(`Generated: ${outputPath}`);

  await browser.close();
}

generate().catch(console.error);
