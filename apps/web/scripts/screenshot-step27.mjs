import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const BROWSER_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const OUT_DIR = "C:\\Users\\LO\\.gemini\\antigravity\\brain\\60b9ac1f-5c1b-452a-b334-360505001724\\screenshots";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const setLocale = async (page, locale) => {
    await page.setCookie({
      name: "NEXT_LOCALE",
      value: locale,
      domain: "localhost",
      path: "/",
    });
  };

  // 1. Desktop /team (English)
  const pageTeam = await browser.newPage();
  await pageTeam.setViewport({ width: 1366, height: 950 });
  await setLocale(pageTeam, "en");
  await pageTeam.goto("http://localhost:3000/team", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageTeam.screenshot({ path: path.join(OUT_DIR, "step27-team-desktop.png"), fullPage: true });
  console.log("Captured step27-team-desktop.png");

  // 2. Open Add Member Sheet on /team
  await pageTeam.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const addBtn = buttons.find((b) => b.textContent?.includes("Add member"));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await pageTeam.screenshot({ path: path.join(OUT_DIR, "step27-team-sheet.png"), fullPage: true });
  console.log("Captured step27-team-sheet.png");
  await pageTeam.close();

  // 3. Mobile /team (390x844)
  const pageTeamMobile = await browser.newPage();
  await pageTeamMobile.setViewport({ width: 390, height: 844 });
  await setLocale(pageTeamMobile, "en");
  await pageTeamMobile.goto("http://localhost:3000/team", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageTeamMobile.screenshot({ path: path.join(OUT_DIR, "step27-team-mobile.png"), fullPage: true });
  console.log("Captured step27-team-mobile.png");
  await pageTeamMobile.close();

  // 4. Arabic /team (RTL)
  const pageTeamArabic = await browser.newPage();
  await pageTeamArabic.setViewport({ width: 1366, height: 950 });
  await setLocale(pageTeamArabic, "ar");
  await pageTeamArabic.goto("http://localhost:3000/team", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageTeamArabic.screenshot({ path: path.join(OUT_DIR, "step27-team-arabic.png"), fullPage: true });
  console.log("Captured step27-team-arabic.png");
  await pageTeamArabic.close();

  // 5. Desktop /settings (Hotel Tab, English)
  const pageSettings = await browser.newPage();
  await pageSettings.setViewport({ width: 1366, height: 1100 });
  await setLocale(pageSettings, "en");
  await pageSettings.goto("http://localhost:3000/settings", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageSettings.screenshot({ path: path.join(OUT_DIR, "step27-settings-desktop.png"), fullPage: true });
  console.log("Captured step27-settings-desktop.png");

  // 6. Switch to Bot Texts Tab with Live Preview
  const tabs = await pageSettings.$$("button[role='tab']");
  if (tabs.length >= 3) {
    await tabs[2].click();
  }
  await new Promise((r) => setTimeout(r, 800));
  await pageSettings.screenshot({ path: path.join(OUT_DIR, "step27-settings-bot.png"), fullPage: true });
  console.log("Captured step27-settings-bot.png");
  await pageSettings.close();

  // 7. Mobile /settings (390x844)
  const pageSettingsMobile = await browser.newPage();
  await pageSettingsMobile.setViewport({ width: 390, height: 844 });
  await setLocale(pageSettingsMobile, "en");
  await pageSettingsMobile.goto("http://localhost:3000/settings", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageSettingsMobile.screenshot({ path: path.join(OUT_DIR, "step27-settings-mobile.png"), fullPage: true });
  console.log("Captured step27-settings-mobile.png");
  await pageSettingsMobile.close();

  // 8. Arabic /settings (RTL)
  const pageSettingsArabic = await browser.newPage();
  await pageSettingsArabic.setViewport({ width: 1366, height: 1100 });
  await setLocale(pageSettingsArabic, "ar");
  await pageSettingsArabic.goto("http://localhost:3000/settings", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await pageSettingsArabic.screenshot({ path: path.join(OUT_DIR, "step27-settings-arabic.png"), fullPage: true });
  console.log("Captured step27-settings-arabic.png");
  await pageSettingsArabic.close();

  await browser.close();
  console.log("All step 2.7 screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
