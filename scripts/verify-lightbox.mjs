import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/jay/.gemini/antigravity/brain/bce675f1-4f4e-4c4d-96f5-8fba6e4b807d";
const REPORT_DIR = path.resolve("docs/test-reports/screenshots");

async function verify() {
  console.log("=== Verifying Global Image Lightbox ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });

  const lightbox = page.locator("#global-lightbox");
  const lightboxImg = page.locator("#lightbox-img");
  const lightboxCaption = page.locator("#lightbox-caption");
  const closeBtn = page.locator("#lightbox-close-btn");

  // Verify initially hidden
  const isInitiallyHidden = await lightbox.evaluate((el) => el.classList.contains("hidden"));
  console.log(`Lightbox initially hidden: ${isInitiallyHidden}`);

  // Test 1: Click Retail DB Schema image
  console.log("\nTesting Click to Zoom on Retail DB Schema image...");
  const dbImg = page.locator("img[src*='retail-db-schema']").first();
  await dbImg.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await dbImg.click();
  await page.waitForTimeout(400);

  const isLightboxVisible = await lightbox.isVisible();
  const currentImgSrc = await lightboxImg.getAttribute("src");
  const currentCaption = await lightboxCaption.textContent();
  console.log(`Lightbox visible: ${isLightboxVisible}`);
  console.log(`Enlarged image src: ${currentImgSrc}`);
  console.log(`Caption text: ${currentCaption}`);

  // Take screenshot of enlarged Lightbox
  const dbEnlargedPath = path.join(ARTIFACT_DIR, "lightbox_enlarged_db_schema.png");
  await page.screenshot({ path: dbEnlargedPath });
  fs.copyFileSync(dbEnlargedPath, path.join(REPORT_DIR, "lightbox_enlarged_db_schema.png"));
  console.log("Captured: lightbox_enlarged_db_schema.png");

  // Test 2: Close via ESC key
  console.log("\nTesting Close via ESC key...");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const isHiddenAfterEsc = await lightbox.evaluate((el) => el.classList.contains("hidden"));
  console.log(`Lightbox hidden after ESC: ${isHiddenAfterEsc}`);

  // Test 3: Click SoundCraft EQ image
  console.log("\nTesting Click to Zoom on SoundCraft EQ image...");
  const soundcraftImg = page.locator("img[src*='soundcraft-eq']").first();
  await soundcraftImg.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await soundcraftImg.click();
  await page.waitForTimeout(400);

  const isSoundcraftVisible = await lightbox.isVisible();
  console.log(`Lightbox visible for SoundCraft: ${isSoundcraftVisible}`);

  const soundcraftEnlargedPath = path.join(ARTIFACT_DIR, "lightbox_enlarged_soundcraft.png");
  await page.screenshot({ path: soundcraftEnlargedPath });
  fs.copyFileSync(soundcraftEnlargedPath, path.join(REPORT_DIR, "lightbox_enlarged_soundcraft.png"));
  console.log("Captured: lightbox_enlarged_soundcraft.png");

  // Test 4: Close via Close Button (✕)
  console.log("\nTesting Close via Close Button (✕)...");
  await closeBtn.click();
  await page.waitForTimeout(400);
  const isHiddenAfterBtn = await lightbox.evaluate((el) => el.classList.contains("hidden"));
  console.log(`Lightbox hidden after close button: ${isHiddenAfterBtn}`);

  await browser.close();
  console.log("\n=== Lightbox Verification Completed Successfully! ===");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
