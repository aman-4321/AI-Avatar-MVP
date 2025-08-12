import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/avatars", "/videos", "/voices", "/studio"];
const authRoutes = ["/"];
const publicRoutes: string[] = [];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const url = new URL("/", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/avatars", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/avatars/:path*",
    "/videos/:path*",
    "/voices/:path*",
    "/studio",
  ],
};
