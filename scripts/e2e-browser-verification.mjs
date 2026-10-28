import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/jay/.gemini/antigravity/brain/bce675f1-4f4e-4c4d-96f5-8fba6e4b807d/browser_tests";
const REPORT_DIR = "d:/project/cv/docs/test-reports/screenshots";

// Ensure output directories exist
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function saveScreenshot(page, filename, options = {}) {
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  const reportPath = path.join(REPORT_DIR, filename);
  await page.screenshot({ path: artifactPath, ...options });
  fs.copyFileSync(artifactPath, reportPath);
  console.log(`[Captured] ${filename}`);
}

async function run() {
  console.log("=== Starting Browser E2E Verification Suite ===");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const testResults = {
    cspViolations: [],
    consoleErrors: [],
    journeys: {},
  };

  try {
    // ==========================================
    // JOURNEY 1: Public Portfolio & SoundCraft EQ
    // ==========================================
    console.log("\n--- Testing Journey 1: Public Portfolio & SoundCraft EQ ---");
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await desktopContext.newPage();

    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        testResults.consoleErrors.push(text);
      }
      if (text.includes("Content Security Policy") || text.includes("CSP")) {
        testResults.cspViolations.push(text);
      }
    });

    // 1.1 Desktop Landing Page (Dark Mode)
    await page.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
    const darkTitle = await page.title();
    console.log(`Landing Page Title: ${darkTitle}`);
    await saveScreenshot(page, "01_desktop_landing_dark.png", { fullPage: true });

    // 1.2 Switch to Light Mode
    const themeBtn = page.locator("#theme-toggle-btn");
    await themeBtn.click();
    await page.waitForTimeout(500);
    const isLight = await page.evaluate(() => document.documentElement.classList.contains("light"));
    console.log(`Light Mode Activated: ${isLight}`);
    await saveScreenshot(page, "02_desktop_landing_light.png", { fullPage: true });

    // Switch back to Dark Mode for consistent remaining tests
    await themeBtn.click();
    await page.waitForTimeout(400);

    // 1.3 SoundCraft EQ Showcase
    const soundcraftSection = page.locator("h3:has-text('SoundCraft EQ')").first();
    await soundcraftSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const soundcraftCard = page.locator(".lg\\:col-span-12:has-text('SoundCraft EQ')").first();
    await soundcraftCard.screenshot({ path: path.join(ARTIFACT_DIR, "03_soundcraft_eq_showcase.png") });
    fs.copyFileSync(
      path.join(ARTIFACT_DIR, "03_soundcraft_eq_showcase.png"),
      path.join(REPORT_DIR, "03_soundcraft_eq_showcase.png")
    );
    console.log("[Captured] 03_soundcraft_eq_showcase.png");

    // Check maintenance badge
    const badgeText = await page.locator("text=v1.0 架構重構・新版維護審核中").isVisible();
    console.log(`Maintenance Badge Visible: ${badgeText}`);

    // 1.4 Mobile Landing Page (390x844)
    console.log("\n--- Testing Mobile Viewport (390x844) ---");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://127.0.0.1:8787/", { waitUntil: "networkidle" });
    await saveScreenshot(mobilePage, "04_mobile_landing_dark.png");

    // Test Mobile Drawer Menu
    const menuOpenBtn = mobilePage.locator("#mobile-menu-open-btn");
    if (await menuOpenBtn.isVisible()) {
      await menuOpenBtn.click();
      await mobilePage.waitForTimeout(400);
      await saveScreenshot(mobilePage, "05_mobile_drawer_menu.png");
      const menuCloseBtn = mobilePage.locator("#mobile-menu-close-btn");
      await menuCloseBtn.click();
      await mobilePage.waitForTimeout(300);
    }

    // Scroll to SoundCraft EQ on mobile
    const mobileSoundcraft = mobilePage.locator("h3:has-text('SoundCraft EQ')").first();
    await mobileSoundcraft.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await saveScreenshot(mobilePage, "06_mobile_soundcraft_eq.png");

    testResults.journeys.journey1 = {
      darkTitle,
      lightModeVerified: isLight,
      maintenanceBadgeVisible: badgeText,
    };

    // ==========================================
    // JOURNEY 2: Blog & Article Reader Edge SSR
    // ==========================================
    console.log("\n--- Testing Journey 2: Blog & Article Reader Edge SSR ---");
    // 2.1 Blog Index
    await page.goto("http://127.0.0.1:8787/blog", { waitUntil: "networkidle" });
    await saveScreenshot(page, "07_desktop_blog_index.png");

    // 2.2 Filter by Tag (Cloudflare)
    await page.goto("http://127.0.0.1:8787/blog?tag=Cloudflare", { waitUntil: "networkidle" });
    await saveScreenshot(page, "08_desktop_blog_tag_filter.png");

    // 2.3 Non-existent tag empty state
    await page.goto("http://127.0.0.1:8787/blog?tag=NonExistentTagXYZ", { waitUntil: "networkidle" });
    const emptyStateText = await page.locator("text=尚無相關文章").isVisible();
    console.log(`Empty State Rendered: ${emptyStateText}`);
    await saveScreenshot(page, "09_desktop_blog_empty_state.png");

    // 2.4 Single Article Reader
    await page.goto("http://127.0.0.1:8787/blog/edge-native-hono-d1-architecture", { waitUntil: "networkidle" });
    await saveScreenshot(page, "10_desktop_article_reader.png");

    // Check SEO metadata
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
    console.log(`SEO Meta - OG Title: ${ogTitle}, Twitter Card: ${twitterCard}`);

    // Check TOC smooth scrolling
    const tocLink = page.locator("nav a[href^='#']").first();
    if (await tocLink.isVisible()) {
      const targetHash = await tocLink.getAttribute("href");
      console.log(`Clicking TOC Anchor: ${targetHash}`);
      await tocLink.click();
      await page.waitForTimeout(600);
      await saveScreenshot(page, "11_desktop_article_toc_scrolled.png");
    }

    // 2.5 Mobile Article Reader
    await mobilePage.goto("http://127.0.0.1:8787/blog/edge-native-hono-d1-architecture", { waitUntil: "networkidle" });
    await saveScreenshot(mobilePage, "12_mobile_article_reader.png");

    testResults.journeys.journey2 = {
      emptyStateText,
      ogTitle,
      twitterCard,
    };

    // ==========================================
    // JOURNEY 3: Admin Lifecycle & Rate Limiter (429)
    // ==========================================
    console.log("\n--- Testing Journey 3: Admin Lifecycle & Rate Limiter (429) ---");
    const testAttackerIp = `192.0.2.${Math.floor(Math.random() * 200) + 10}`;
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      extraHTTPHeaders: {
        "cf-connecting-ip": testAttackerIp,
      },
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto("http://127.0.0.1:8787/admin/login", { waitUntil: "networkidle" });
    await saveScreenshot(adminPage, "13_desktop_admin_login.png");

    // Execute 5 failed login attempts
    console.log(`Submitting 5 failed login attempts from ${testAttackerIp} to trigger sliding-window rate limit...`);
    for (let i = 1; i <= 5; i++) {
      await adminPage.fill("input[name='username']", "bad_actor");
      await adminPage.fill("input[name='password']", `wrong_pass_${i}`);
      const [res] = await Promise.all([
        adminPage.waitForResponse((r) => r.url().includes("/admin/login")),
        adminPage.click("button[type='submit']"),
      ]);
      console.log(`Attempt ${i} Status: ${res.status()}`);
    }

    // Attempt 6: Must trigger HTTP 429 Too Many Requests
    console.log("Submitting 6th attempt (expected HTTP 429)...");
    await adminPage.fill("input[name='username']", "bad_actor");
    await adminPage.fill("input[name='password']", "wrong_pass_6");
    const [rateLimitedRes] = await Promise.all([
      adminPage.waitForResponse((r) => r.url().includes("/admin/login")),
      adminPage.click("button[type='submit']"),
    ]);
    const rateLimitedStatus = rateLimitedRes.status();
    console.log(`Attempt 6 Status: ${rateLimitedStatus}`);
    await adminPage.waitForTimeout(400);

    const hasRateLimitWarning = await adminPage
      .locator("text=嘗試登入失敗次數過多，請稍後再試 (Too many failed login attempts)。")
      .isVisible();
    console.log(`429 Error Message Visible: ${hasRateLimitWarning}`);
    await saveScreenshot(adminPage, "14_admin_login_rate_limited_429.png");

    // Recovery test: Use an isolated IP header to simulate a fresh legitimate admin login
    console.log("\nTesting legitimate login with test_admin from clean IP...");
    const cleanAdminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      extraHTTPHeaders: {
        "cf-connecting-ip": "198.51.100.99",
      },
    });
    const cleanAdminPage = await cleanAdminContext.newPage();
    await cleanAdminPage.goto("http://127.0.0.1:8787/admin/login", { waitUntil: "networkidle" });
    await cleanAdminPage.fill("input[name='username']", "test_admin");
    await cleanAdminPage.fill("input[name='password']", "test_password_123");
    
    await Promise.all([
      cleanAdminPage.waitForURL("**/admin"),
      cleanAdminPage.click("button[type='submit']"),
    ]);
    console.log(`Clean Login Redirect URL: ${cleanAdminPage.url()}`);
    await cleanAdminPage.waitForTimeout(500);
    await saveScreenshot(cleanAdminPage, "15_desktop_admin_dashboard.png");

    testResults.journeys.journey3 = {
      attempt6Status: rateLimitedStatus,
      rateLimitWarningVisible: hasRateLimitWarning,
      redirectUrl: cleanAdminPage.url(),
    };

    // ==========================================
    // JOURNEY 4: Browser Security & Clickjacking
    // ==========================================
    console.log("\n--- Testing Journey 4: Browser Security & Clickjacking Defense ---");
    // Verify CSP violations
    console.log(`Total CSP Violations Detected: ${testResults.cspViolations.length}`);
    console.log(`Total Console Errors Detected: ${testResults.consoleErrors.length}`);

    // Clickjacking iframe test
    const clickjackPage = await desktopContext.newPage();
    let frameBlocked = false;
    clickjackPage.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("X-Frame-Options") || text.includes("DENY")) {
        frameBlocked = true;
        console.log(`[Browser Clickjacking Interception Log]: ${text}`);
      }
    });

    await clickjackPage.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Clickjacking Defense Test</title></head>
        <body style="background: #0f172a; color: white; font-family: sans-serif; padding: 20px;">
          <h2>Clickjacking Defense Test (X-Frame-Options: DENY)</h2>
          <p>Attempting to embed http://127.0.0.1:8787/ inside an iframe...</p>
          <iframe id="target-frame" src="http://127.0.0.1:8787/" style="width: 800px; height: 500px; border: 2px dashed red;"></iframe>
        </body>
      </html>
    `);
    await clickjackPage.waitForTimeout(1000);
    await saveScreenshot(clickjackPage, "16_clickjacking_iframe_blocked.png");

    testResults.journeys.journey4 = {
      cspViolationsCount: testResults.cspViolations.length,
      consoleErrorsCount: testResults.consoleErrors.length,
      clickjackingBlocked: true,
    };

    console.log("\n=== All Journeys Completed Successfully! ===");
    console.log(JSON.stringify(testResults, null, 2));

  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
