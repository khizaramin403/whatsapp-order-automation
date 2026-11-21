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

  // 1. Kitchen Desktop (1280x800)
  console.log("1. Capturing Kitchen Desktop...");
  await setLang("en");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/kitchen", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-kitchen-desktop.png") });
  console.log("-> Saved step24-kitchen-desktop.png");

  // 2. Kitchen Mobile (390x844)
  console.log("2. Capturing Kitchen Mobile...");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/kitchen", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-kitchen-mobile.png") });
  console.log("-> Saved step24-kitchen-mobile.png");

  // 3. Kitchen Arabic (1280x800)
  console.log("3. Capturing Kitchen Arabic...");
  await setLang("ar");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/kitchen", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-kitchen-arabic.png") });
  console.log("-> Saved step24-kitchen-arabic.png");

  // 4. Delivery Desktop (1280x800)
  console.log("4. Capturing Delivery Desktop...");
  await setLang("en");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/delivery", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-delivery-desktop.png") });
  console.log("-> Saved step24-delivery-desktop.png");

  // 5. Delivery Mobile (390x844)
  console.log("5. Capturing Delivery Mobile...");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/delivery", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-delivery-mobile.png") });
  console.log("-> Saved step24-delivery-mobile.png");

  // 6. Delivery Arabic (1280x800)
  console.log("6. Capturing Delivery Arabic...");
  await setLang("ar");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/delivery", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-delivery-arabic.png") });
  console.log("-> Saved step24-delivery-arabic.png");

  await browser.close();
  console.log("All Step 2.4 screenshots successfully created in:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
