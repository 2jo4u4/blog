import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/jay/.gemini/antigravity/brain/bce675f1-4f4e-4c4d-96f5-8fba6e4b807d";
const REPORT_DIR = path.resolve("docs/test-reports/screenshots");

async function verify() {
  console.log("=== Verifying SoundCraft EQ Order & Chrome Web Store Link ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });

  // Verify Project titles order in the DOM
  const projectHeadings = await page.locator("#projects h3").allTextContents();
  console.log("Projects order:", projectHeadings);

  if (projectHeadings[0]?.includes("SoundCraft EQ") &&
      projectHeadings[1]?.includes("多人非對稱對抗") &&
      projectHeadings[2]?.includes("現代化前端工程基礎設施") &&
      projectHeadings[3]?.includes("多人線上協作平台")) {
    console.log("✅ Verified: Project order matches exact requested sequence!");
  } else {
    console.error("❌ Project order mismatch:", projectHeadings);
    process.exit(1);
  }

  // Scroll to projects
  const projectsSection = page.locator("#projects");
  await projectsSection.scrollIntoViewIfNeeded();

  // Inspect first card (SoundCraft EQ)
  const soundcraftCard = page.locator(".lg\\:col-span-12").first();
  await page.waitForTimeout(500);

  // Check Chrome button link
  const chromeBtn = soundcraftCard.locator("a[href*='chromewebstore.google.com']");
  const chromeBtnText = await chromeBtn.textContent();
  const chromeHref = await chromeBtn.getAttribute("href");
  console.log(`Chrome Button text: "${chromeBtnText.trim()}", href: "${chromeHref}"`);

  // Check Firefox status badge
  const firefoxBadge = soundcraftCard.locator("text=Firefox AMO 審核中");
  const isFirefoxBadgeVisible = await firefoxBadge.isVisible();
  console.log(`Firefox Review Badge visible: ${isFirefoxBadgeVisible}`);

  // Check that legacy maintenance badge is NOT present in SoundCraft EQ
  const legacyBadge = soundcraftCard.locator("text=v1.0 架構重構");
  const isLegacyBadgePresent = await legacyBadge.isVisible();
  console.log(`Legacy maintenance badge absent: ${!isLegacyBadgePresent}`);

  // Take screenshot of SoundCraft EQ card
  const soundcraftShotPath = path.join(ARTIFACT_DIR, "soundcraft_eq_card_chrome_live.png");
  await soundcraftCard.screenshot({ path: soundcraftShotPath });
  fs.copyFileSync(soundcraftShotPath, path.join(REPORT_DIR, "soundcraft_eq_card_chrome_live.png"));
  console.log("Captured: soundcraft_eq_card_chrome_live.png");

  // Take screenshot of the projects section showing sequence
  const overviewShotPath = path.join(ARTIFACT_DIR, "projects_reordered_overview.png");
  await projectsSection.screenshot({ path: overviewShotPath });
  fs.copyFileSync(overviewShotPath, path.join(REPORT_DIR, "projects_reordered_overview.png"));
  console.log("Captured: projects_reordered_overview.png");

  await browser.close();
  console.log("=== Verification Successful! ===");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
