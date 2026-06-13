import { NextResponse } from "next/server";

export function getAdminSecret(): string | undefined {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret && secret.length > 0 ? secret : undefined;
}

export function isAuthorizedAdmin(request: Request): boolean {
  const secret = getAdminSecret();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) {
    return true;
  }

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)blackbook_admin=([^;]+)/);
  return match?.[1] === secret;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
