import path from "path";

const PROJECT_BROWSERS_DIR = path.join(process.cwd(), ".playwright-browsers");

/** Ensure Chromium resolves from the project directory, not a stale sandbox cache. */
export function ensurePlaywrightBrowsersPath(): string {
  if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = PROJECT_BROWSERS_DIR;
  }
  return process.env.PLAYWRIGHT_BROWSERS_PATH;
}

export function isMissingPlaywrightBrowserError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Executable doesn't exist") ||
    message.includes("browserType.launch") ||
    message.includes("npx playwright install")
  );
}

export function formatPlaywrightInstallHint(): string {
  return (
    "Playwright Chromium is not installed for this project.\n\n" +
    "Run in the project root:\n\n" +
    "  npm run playwright:install\n\n" +
    "Then restart the dev server and try again."
  );
}

export async function launchChromium() {
  ensurePlaywrightBrowsersPath();
  const { chromium } = await import("playwright");

  try {
    return await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (error) {
    if (isMissingPlaywrightBrowserError(error)) {
      throw new Error(formatPlaywrightInstallHint());
    }
    throw error;
  }
}
