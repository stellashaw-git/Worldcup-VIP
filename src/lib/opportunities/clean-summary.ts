const JUNK_LINE_PATTERNS = [
  /skip to main content/i,
  /cookie/i,
  /onetrust/i,
  /do not sell/i,
  /personal information/i,
  /intcmp=/i,
  /utm_/i,
  /utm_source/i,
  /digitalhub\.fifa/i,
  /transform:/i,
  /io=transform/i,
  /powered by/i,
  /cookielaw/i,
  /^\*?\s*$/,
];

function isJunkLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 25) return true;

  return JUNK_LINE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function cleanScrapedSummary(raw: string, title: string): string {
  let text = raw;

  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  text = text.replace(/https?:\/\/[^\s)]+/g, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\*+/g, " ");

  const segments = text
    .split(/(?<=[.!?])\s+|\s*\|\s*/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter((segment) => segment.length > 0 && !isJunkLine(segment));

  const uniqueSegments = [...new Set(segments)];
  let summary = uniqueSegments.slice(0, 2).join(" ").replace(/\s+/g, " ").trim();

  if (summary.length > 320) {
    summary = `${summary.slice(0, 317).trim()}...`;
  }

  if (summary.length < 50) {
    return `Public reference for ${title}. This opportunity was surfaced from open web sources for discovery in the BLACKBOOK directory. Request updates below for availability information.`;
  }

  return summary;
}
