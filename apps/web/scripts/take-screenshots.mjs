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

  // Helper to set locale cookie
  const setLang = async (lang) => {
    await page.setCookie({
      name: "NEXT_LOCALE",
      value: lang,
      domain: "localhost",
      path: "/",
    });
  };

  // 1. Desktop Login (1280x800, English)
  await setLang("en");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-desktop.png") });
  console.log("1. Captured Desktop Login");

  // 2. Mobile Login (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-mobile.png") });
  console.log("2. Captured Mobile Login");

  // 3. Arabic RTL Login (1280x800)
  await setLang("ar");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-arabic.png") });
  console.log("3. Captured Arabic RTL Login");

  // 4. Error State (fail@test.com)
  await setLang("en");
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("#email", "fail@test.com");
  await page.type("#password", "password123");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-error.png") });
  console.log("4. Captured Login Error State");

  // 5. Warning State (wait@test.com)
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("#email", "wait@test.com");
  await page.type("#password", "password123");
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-warning.png") });
  console.log("5. Captured Login Warning State");

  // 6. Loading State (capture while spinner and Signing in... are active)
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle0" });
  await page.type("#email", "owner@hotel.com");
  await page.type("#password", "password123");
  const submitPromise = page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 150));
  await page.screenshot({ path: path.join(OUT_DIR, "step17-login-loading.png") });
  console.log("6. Captured Login Loading State");
  await submitPromise;

  await browser.close();
  console.log("All Step 1.7 screenshots saved to:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
