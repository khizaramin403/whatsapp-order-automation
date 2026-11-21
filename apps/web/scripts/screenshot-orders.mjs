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
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Loading Skeleton State
  await page.goto("http://localhost:3000/orders?loading=true", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT_DIR, "step22-orders-loading.png") });
  console.log("1. Captured Loading State");

  // 2. Desktop Orders Board (1280x800, English)
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step22-orders-desktop.png") });
  console.log("2. Captured Desktop Orders Board");

  // 3. Test Clicking "Accept" on first New order card
  const acceptButton = await page.$('button.bg-\\[\\#C7A667\\]');
  if (acceptButton) {
    await acceptButton.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUT_DIR, "step22-orders-after-accept.png") });
    console.log("3. Captured Orders Board after clicking Accept");
  }

  // 4. Mobile Orders Board (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step22-orders-mobile.png") });
  console.log("4. Captured Mobile Orders Board");

  // 5. Arabic RTL Orders Board (1280x800)
  await setLang("ar");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step22-orders-arabic.png") });
  console.log("5. Captured Arabic RTL Orders Board");

  await browser.close();
  console.log("All Step 2.2 screenshots saved to:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
