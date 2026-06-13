import { launchChromium } from "@/lib/official-sources/playwright-launch";
import { collectMatchCardTextsScript } from "@/lib/official-sources/collect-match-cards";

const PAGE_TIMEOUT_MS = 45_000;

export async function extractPageText(url: string): Promise<string> {
  const browser = await launchChromium();

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    await page.waitForTimeout(3000);

    try {
      await page.waitForSelector("text=/vs/i", { timeout: 10000 });
    } catch {
      // Continue with body text fallback.
    }

    const { cards, bodyLength } = await page.evaluate(collectMatchCardTextsScript);

    const combined = [...new Set(cards)].join("\n\n---\n\n");
    if (combined.length > 200) {
      return combined;
    }

    if (bodyLength > 0) {
      return await page.evaluate(() => document.body?.innerText?.trim() ?? "");
    }

    return "";
  } finally {
    await browser.close();
  }
}
