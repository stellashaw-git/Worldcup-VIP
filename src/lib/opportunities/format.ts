import type { AccessRecord, Availability } from "@/lib/opportunities/types";

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatPriceRange(
  priceMin: number | null,
  priceMax: number | null,
  currency = "USD"
): string {
  if (priceMin === null && priceMax === null) {
    return "Unknown";
  }

  const min = priceMin ?? priceMax;
  const max = priceMax ?? priceMin;

  if (min === null || max === null) {
    return "Unknown";
  }

  if (min !== max) {
    return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
  }

  if (min >= 100000) {
    return `${formatCurrency(min, currency)}+`;
  }

  if (min >= 10000) {
    return `${formatCurrency(min, currency)}+`;
  }

  return formatCurrency(min, currency);
}

export function formatCapacity(capacity: string): string {
  if (!capacity || capacity === "Unknown") {
    return "Unknown";
  }
  return capacity;
}

export function formatField(value: string): string {
  if (!value || value.trim() === "" || value === "Unknown") {
    return "Unknown";
  }
  return value;
}

export function formatLastUpdated(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export const availabilityVariant: Record<
  Availability,
  "default" | "secondary" | "outline"
> = {
  Available: "default",
  Limited: "secondary",
  "Inquiry Required": "outline",
  Waitlist: "outline",
  Unknown: "outline",
};

export function computeMetricsAveragePrice(records: AccessRecord[]): {
  averagePriceMin: number | null;
  averagePriceMax: number | null;
  currency: string;
} {
  const withPrices = records.filter((r) => r.priceMin !== null || r.priceMax !== null);

  if (!withPrices.length) {
    return { averagePriceMin: null, averagePriceMax: null, currency: "USD" };
  }

  const mins = withPrices.map((r) => r.priceMin ?? r.priceMax!).filter(Boolean);
  const maxs = withPrices.map((r) => r.priceMax ?? r.priceMin!).filter(Boolean);

  const averagePriceMin = Math.round(
    mins.reduce((sum, v) => sum + v, 0) / mins.length
  );
  const averagePriceMax = Math.round(
    maxs.reduce((sum, v) => sum + v, 0) / maxs.length
  );

  return {
    averagePriceMin,
    averagePriceMax,
    currency: withPrices[0]?.currency ?? "USD",
  };
}
