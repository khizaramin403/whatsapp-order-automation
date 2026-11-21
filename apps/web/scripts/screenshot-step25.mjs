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

  // 1. Desktop /menu
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1366, height: 768 });
  await pageDesktop.goto("http://localhost:3000/menu", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await pageDesktop.screenshot({ path: path.join(OUT_DIR, "step25-menu-desktop.png") });
  console.log("Captured step25-menu-desktop.png");

  // 2. Item Form Sheet on Desktop
  // Click "Add Item" button
  await pageDesktop.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const addBtn = buttons.find((b) => b.textContent?.includes("Add Item") || b.textContent?.includes("إضافة صنف"));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await pageDesktop.screenshot({ path: path.join(OUT_DIR, "step25-menu-item-sheet.png") });
  console.log("Captured step25-menu-item-sheet.png");
  await pageDesktop.close();

  // 3. Mobile /menu (390x844 iPhone 12/13/14)
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844 });
  await pageMobile.goto("http://localhost:3000/menu", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await pageMobile.screenshot({ path: path.join(OUT_DIR, "step25-menu-mobile.png") });
  console.log("Captured step25-menu-mobile.png");
  await pageMobile.close();

  // 4. Arabic /menu (RTL)
  const pageArabic = await browser.newPage();
  await pageArabic.setViewport({ width: 1366, height: 768 });
  await pageArabic.goto("http://localhost:3000/menu", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  // Switch language to Arabic via topbar pill
  await pageArabic.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const arBtn = buttons.find((b) => b.textContent?.includes("العربية") || b.textContent?.trim() === "AR");
    if (arBtn) arBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageArabic.screenshot({ path: path.join(OUT_DIR, "step25-menu-arabic.png") });
  console.log("Captured step25-menu-arabic.png");
  await pageArabic.close();

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
