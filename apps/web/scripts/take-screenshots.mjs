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

  // Set English cookie
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "en",
    domain: "localhost",
    path: "/",
  });

  // 1. Desktop view with Topbar & User Menu opened from Topbar Avatar
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  // Click Topbar avatar to open User Menu
  const topbarAvatarBtn = await page.$('header button[aria-label*="user menu"], header button[aria-label*="User menu"]');
  if (topbarAvatarBtn) {
    await topbarAvatarBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step16-desktop-topbar-usermenu.png") });
  console.log("1. Captured Desktop Topbar with User Menu");

  // 2. Sidebar Footer User Menu trigger
  // Click outside to close topbar menu
  await page.mouse.click(500, 500);
  await new Promise((r) => setTimeout(r, 300));

  // Click sidebar footer user trigger
  const sidebarFooter = await page.$('aside div[role="button"][title*="profile"], aside div[role="button"][title*="user"]');
  if (sidebarFooter) {
    await sidebarFooter.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step16-sidebar-footer-usermenu.png") });
  console.log("2. Captured Sidebar Footer with User Menu");

  // 3. Mobile view (390x844) showing ONLY title, live dot, bell and avatar
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, "step16-mobile-topbar.png") });
  console.log("3. Captured Mobile Topbar (title, live dot, bell, avatar only)");

  // 4. Arabic RTL Topbar and User Menu
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "ar",
    domain: "localhost",
    path: "/",
  });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://localhost:3000/orders", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  // Click Arabic Topbar avatar
  const arAvatarBtn = await page.$('header button[aria-label*="المستخدم"], header button[aria-label*="user menu"]');
  if (arAvatarBtn) {
    await arAvatarBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(OUT_DIR, "step16-arabic-topbar-usermenu.png") });
  console.log("4. Captured Arabic RTL Topbar and User Menu");

  // Reset cookie back to English
  await page.setCookie({
    name: "NEXT_LOCALE",
    value: "en",
    domain: "localhost",
    path: "/",
  });

  await browser.close();
  console.log("Step 1.6 screenshots captured in:", OUT_DIR);
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
