import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const browsersPath = path.join(process.cwd(), ".playwright-browsers");
process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;

if (process.env.VERCEL || process.env.CI) {
  console.log(
    "[BLACKBOOK] Skipping Playwright browser install on Vercel/CI. Use /admin/import or starter directory."
  );
  process.exit(0);
}

function hasChromium() {
  if (!fs.existsSync(browsersPath)) return false;
  const entries = fs.readdirSync(browsersPath, { withFileTypes: true });
  return entries.some(
    (entry) =>
      entry.isDirectory() &&
      (entry.name.startsWith("chromium") ||
        entry.name.startsWith("chromium_headless_shell"))
  );
}

if (hasChromium()) {
  console.log("[BLACKBOOK] Playwright Chromium already installed.");
  process.exit(0);
}

console.log(
  "[BLACKBOOK] Installing Playwright Chromium to .playwright-browsers ..."
);

const result = spawnSync(
  "npx",
  ["playwright", "install", "chromium"],
  {
    stdio: "inherit",
    env: process.env,
    shell: true,
  }
);

if (result.status !== 0) {
  console.warn(
    "[BLACKBOOK] Playwright install skipped or failed. Run: npm run playwright:install"
  );
}
