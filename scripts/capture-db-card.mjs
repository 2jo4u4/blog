import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/jay/.gemini/antigravity/brain/bce675f1-4f4e-4c4d-96f5-8fba6e4b807d";
const REPORT_DIR = path.resolve("docs/test-reports/screenshots");

async function capture() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });

  const card = page.locator(".lg\\:col-span-12:has-text('零售交易關聯式資料庫設計與進階 SQL 分析')").first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Capture Dark Mode
  const darkPath = path.join(ARTIFACT_DIR, "retail_db_card_dark.png");
  await card.screenshot({ path: darkPath });
  fs.copyFileSync(darkPath, path.join(REPORT_DIR, "retail_db_card_dark.png"));
  console.log("Captured: retail_db_card_dark.png");

  // Switch to Light Mode
  await page.locator("#theme-toggle-btn").click();
  await page.waitForTimeout(500);
  const lightPath = path.join(ARTIFACT_DIR, "retail_db_card_light.png");
  await card.screenshot({ path: lightPath });
  fs.copyFileSync(lightPath, path.join(REPORT_DIR, "retail_db_card_light.png"));
  console.log("Captured: retail_db_card_light.png");

  // Also capture updated Vegeking button
  const vegekingCard = page.locator(".lg\\:col-span-12:has-text('電商平台')").first();
  await vegekingCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const btnPath = path.join(ARTIFACT_DIR, "vegeking_btn_updated.png");
  await vegekingCard.screenshot({ path: btnPath });
  fs.copyFileSync(btnPath, path.join(REPORT_DIR, "vegeking_btn_updated.png"));
  console.log("Captured: vegeking_btn_updated.png");

  await browser.close();
}

capture().catch(console.error);
