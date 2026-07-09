import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware bảo vệ route /admin và /api/admin/*
 *
 * - /admin/*: Chỉ ADMIN mới vào được.
 *   Check JWT từ cookie hoặc Authorization header → decode role.
 *   Nếu không phải ADMIN → redirect 404.
 *
 * - /api/admin/*: Đã có backend permission classes bảo vệ.
 *   Middleware chỉ forward request, không can thiệp.
 */

function decodeJwt(token: string): Record<string, any> | null {
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const payload = base64.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64").toString());
  } catch {
    return null;
  }
}

function getToken(request: NextRequest): string | null {
  // Try cookie first (httpOnly cookie set by backend on login)
  const cookieToken = request.cookies.get("accessToken")?.value;
  if (cookieToken) return cookieToken;

  // Try Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin page routes: /admin, /admin/* ──────────────────
  if (pathname.startsWith("/admin")) {
    // Allow the login page itself (in case admin layout redirects here)
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = getToken(request);

    if (!token) {
      // No token → redirect to 404 page
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    const payload = decodeJwt(token);
    if (!payload || (payload.role !== "ADMIN" && !payload.is_superuser && !payload.is_staff)) {
      // Not admin → 404
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    // Admin user → allow
    return NextResponse.next();
  }

  // ── All other routes → allow ──────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all /admin routes.
     * Skip Next.js internals, static files, and API routes (API is protected by backend).
     */
    "/admin/:path*",
  ],
};
