import path from "path";

/**
 * Writable data directory. On Vercel, only /tmp is writable (ephemeral).
 * For durable leads/review data in production, migrate to Supabase or Vercel KV.
 */
export function getDataDir(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "blackbook-data");
  }
  return path.join(process.cwd(), "data");
}
