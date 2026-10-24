import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Gate /admin (ADMIN role) and /account (any signed-in user).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (token.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/account") && !token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
