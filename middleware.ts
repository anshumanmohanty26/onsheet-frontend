import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api");

  // The real httpOnly accessToken cookie is set on the API domain and
  // is invisible to this middleware. The frontend sets a lightweight
  // "session" marker cookie after login/register to signal auth state.
  const hasToken = request.cookies.has("session");

  if (!isPublic && !hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated, don't show auth pages or landing
  if (hasToken && (pathname === "/" || pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
