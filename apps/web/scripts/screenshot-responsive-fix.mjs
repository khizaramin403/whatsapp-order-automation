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

  const page = await browser.newPage();
  // Set 14-inch laptop viewport (1366x768)
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(OUT_DIR, "step24-responsive-fix-1366.png") });
  console.log("Captured step24-responsive-fix-1366.png");

  // Also test 1280x800
  await page.setViewport({ width: 1280, height: 800 });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, "step24-responsive-fix-1280.png") });
  console.log("Captured step24-responsive-fix-1280.png");

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
