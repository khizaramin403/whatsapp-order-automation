import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const OUT_DIR = "C:\\Users\\LO\\.gemini\\antigravity\\brain\\4ac1d6f9-803b-4f04-959a-fc886f6e49ba\\screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log("Using browser at:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // Helper to set cookie for English
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "en",
    domain: "localhost",
    path: "/",
  });

  // 1. Expanded sidebar
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  // Ensure sidebar is expanded
  const isCollapsed = await page.$('aside[data-state="collapsed"]');
  if (isCollapsed) {
    const expandBtn = await page.$('aside button[aria-label*="Expand"], aside button[aria-label*="expand"], aside button');
    if (expandBtn) {
      await expandBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  await page.screenshot({ path: path.join(OUT_DIR, "01-expanded.png") });
  console.log("1. Captured expanded sidebar");

  // 2. Collapsed sidebar
  const collapseBtn = await page.$(
    'aside button[title*="Collapse"], aside button[aria-label*="Collapse"], aside button[title*="sidebar"], aside button[aria-label*="sidebar"]'
  );
  if (collapseBtn) {
    await collapseBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  } else {
    await page.keyboard.down("Control");
    await page.keyboard.press("KeyB");
    await page.keyboard.up("Control");
    await new Promise((r) => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "02-collapsed.png") });
  console.log("2. Captured collapsed sidebar");

  // 3. Collapsed with tooltip
  const ordersLink = await page.$('aside a[href="/orders"]');
  if (ordersLink) {
    await ordersLink.hover();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "03-collapsed-tooltip.png") });
  console.log("3. Captured collapsed sidebar with tooltip");

  // 4. Mobile view
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));

  const menuBtn = await page.$(
    'header button[aria-label*="menu"], header button[aria-label*="Navigation"], header button[aria-label*="navigation"]'
  );
  if (menuBtn) {
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "04-mobile.png") });
  console.log("4. Captured mobile sidebar");

  // 5. Arabic view (expanded and collapsed)
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "ar",
    domain: "localhost",
    path: "/",
  });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  // If collapsed, expand it for Arabic expanded screenshot
  const isArCollapsed = await page.$('aside[data-state="collapsed"]');
  if (isArCollapsed) {
    const arExpandBtn = await page.$('aside button');
    if (arExpandBtn) {
      await arExpandBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  await page.screenshot({ path: path.join(OUT_DIR, "05-arabic-expanded.png") });
  console.log("5. Captured Arabic expanded sidebar");

  // Also collapse Arabic for collapsed view
  const arCollapseBtn = await page.$('aside button');
  if (arCollapseBtn) {
    await arCollapseBtn.click();
    await new Promise((r) => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "06-arabic-collapsed.png") });
  console.log("6. Captured Arabic collapsed sidebar");

  // Reset cookie back to English
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "en",
    domain: "localhost",
    path: "/",
  });

  await browser.close();
  console.log("All screenshots successfully captured in:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
