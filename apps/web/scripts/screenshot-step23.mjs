import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const OUT_DIR = "C:\\Users\\LO\\.gemini\\antigravity\\brain\\60b9ac1f-5c1b-452a-b334-360505001724\\screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log("Using browser at:", CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  const setLang = async (lang) => {
    await page.setCookie({
      name: "NEXT_LOCALE",
      value: lang,
      domain: "localhost",
      path: "/",
    });
  };

  await setLang("en");

  // 1. Desktop Order Detail Sheet (1280x800)
  console.log("1. Capturing Desktop Order Detail Sheet...");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  // Click on the first order card to open sheet
  const firstCard = await page.$('div[role="button"], .cursor-pointer.hover\\:border-\\[\\#C7A667\\]');
  if (firstCard) {
    await firstCard.click();
    await new Promise((r) => setTimeout(r, 700)); // wait for sheet slide-in
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step23-sheet-desktop.png") });
  console.log("-> Saved step23-sheet-desktop.png");

  // 2. Enlarged Screenshot Viewer Modal (dynamic import)
  console.log("2. Capturing Enlarged Screenshot Viewer Modal...");
  const viewProofBtn = await page.$('button.text-\\[\\#7D6228\\]');
  if (viewProofBtn) {
    await viewProofBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, "step23-modal-screenshot.png") });
    console.log("-> Saved step23-modal-screenshot.png");

    // Close dialog with Escape key
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 400));
  }

  // 3. Mobile Order Detail Bottom Sheet (390x844)
  console.log("3. Capturing Mobile Bottom Sheet...");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  const mobileCard = await page.$('.cursor-pointer.hover\\:border-\\[\\#C7A667\\]');
  if (mobileCard) {
    await mobileCard.click();
    await new Promise((r) => setTimeout(r, 700));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step23-sheet-mobile.png") });
  console.log("-> Saved step23-sheet-mobile.png");

  // 4. Arabic RTL Order Detail Sheet (1280x800)
  console.log("4. Capturing Arabic RTL Order Detail Sheet...");
  await setLang("ar");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  const arabicCard = await page.$('.cursor-pointer.hover\\:border-\\[\\#C7A667\\]');
  if (arabicCard) {
    await arabicCard.click();
    await new Promise((r) => setTimeout(r, 700));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step23-sheet-arabic.png") });
  console.log("-> Saved step23-sheet-arabic.png");

  // 5. Fake Live Order Arrival Toast & Board Update
  console.log("5. Capturing Live Order Arrival Toast...");
  await setLang("en");
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  // Trigger new order arrival via window helper
  await page.evaluate(async () => {
    if (typeof window.__triggerFakeNewOrder === "function") {
      await window.__triggerFakeNewOrder();
    }
  });
  await new Promise((r) => setTimeout(r, 600)); // wait for toast animation
  await page.screenshot({ path: path.join(OUT_DIR, "step23-toast.png") });
  console.log("-> Saved step23-toast.png");

  await browser.close();
  console.log("All Step 2.3 screenshots successfully created in:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
