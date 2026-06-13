const MONTH_NAMES =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const MONTH_SHORT =
  "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";

function normalizeDateString(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function findDateInText(text: string): string | null {
  const candidates: string[] = [];

  const longDate = text.match(
    new RegExp(
      `\\b(${MONTH_NAMES})\\s+\\d{1,2},?\\s+2026\\b`,
      "gi"
    )
  );
  if (longDate) candidates.push(...longDate);

  const shortDate = text.match(
    new RegExp(`\\b(${MONTH_SHORT})\\.?\\s+\\d{1,2},?\\s+2026\\b`, "gi")
  );
  if (shortDate) candidates.push(...shortDate);

  const slashDate = text.match(
    /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-]2026\b/g
  );
  if (slashDate) candidates.push(...slashDate);

  const isoDate = text.match(/\b2026-\d{2}-\d{2}\b/g);
  if (isoDate) candidates.push(...isoDate);

  const rangeDate = text.match(
    new RegExp(
      `\\b(${MONTH_SHORT})\\.?\\s+\\d{1,2}\\s*[-–]\\s*(${MONTH_SHORT})\\.?\\s+\\d{1,2},?\\s+2026\\b`,
      "gi"
    )
  );
  if (rangeDate) candidates.push(...rangeDate);

  const tournamentRange = text.match(
    /\b(?:june|jun\.?)\s+\d{1,2}\s*[-–]\s*(?:july|jul\.?)\s+\d{1,2},?\s+2026\b/gi
  );
  if (tournamentRange) candidates.push(...tournamentRange);

  const releaseDate = text.match(
    new RegExp(
      `(?:available|release|on sale|starting|from)\\s+(?:on\\s+)?(${MONTH_NAMES}\\s+\\d{1,2},?\\s+2026)`,
      "gi"
    )
  );
  if (releaseDate) {
    for (const match of releaseDate) {
      const inner = match.match(
        new RegExp(`(${MONTH_NAMES})\\s+\\d{1,2},?\\s+2026`, "i")
      );
      if (inner) candidates.push(inner[0]);
    }
  }

  const scheduleLine = text.match(
    /\bmatch\s+(?:on|date)[:\s]+([^\n|.]{6,40}2026[^\n|.]{0,10})/gi
  );
  if (scheduleLine) {
    for (const line of scheduleLine) {
      const inner = line.match(
        new RegExp(`(${MONTH_NAMES}|${MONTH_SHORT})\\.?\\s+\\d{1,2},?\\s+2026`, "i")
      );
      if (inner) candidates.push(inner[0]);
    }
  }

  if (/\bworld cup 2026\b/i.test(text) && /\bjune\b/i.test(text)) {
    const wcRange = text.match(
      /\b(?:june|jun\.?)\s+\d{1,2}.*?(?:july|jul\.?)\s+\d{1,2},?\s+2026\b/i
    );
    if (wcRange) candidates.push(wcRange[0]);
  }

  if (candidates.length === 0) {
    if (/\b2026\b/.test(text) && /\b(tournament|world cup|fifa)\b/i.test(text)) {
      return "2026 Tournament";
    }
    return null;
  }

  return normalizeDateString(candidates[0]);
}
