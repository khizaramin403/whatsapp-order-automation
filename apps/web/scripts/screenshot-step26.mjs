import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const OUT_DIR = "C:\\Users\\LO\\.gemini\\antigravity\\brain\\60b9ac1f-5c1b-452a-b334-360505001724\\screenshots";

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  // 1. Desktop /analytics
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1366, height: 1100 });
  await pageDesktop.goto("http://localhost:3000/analytics", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageDesktop.screenshot({ path: path.join(OUT_DIR, "step26-analytics-desktop.png"), fullPage: true });
  console.log("Captured step26-analytics-desktop.png");
  await pageDesktop.close();

  // 2. Mobile /analytics (390x844)
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844 });
  await pageMobile.goto("http://localhost:3000/analytics", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageMobile.screenshot({ path: path.join(OUT_DIR, "step26-analytics-mobile.png"), fullPage: true });
  console.log("Captured step26-analytics-mobile.png");
  await pageMobile.close();

  // 3. Arabic /analytics (RTL)
  const pageArabic = await browser.newPage();
  await pageArabic.setViewport({ width: 1366, height: 1100 });
  await pageArabic.goto("http://localhost:3000/analytics", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  // Switch to Arabic via topbar
  await pageArabic.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const arBtn = buttons.find((b) => b.textContent?.includes("العربية") || b.textContent?.trim() === "AR");
    if (arBtn) arBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageArabic.screenshot({ path: path.join(OUT_DIR, "step26-analytics-arabic.png"), fullPage: true });
  console.log("Captured step26-analytics-arabic.png");
  await pageArabic.close();

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
