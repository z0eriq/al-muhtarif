import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasAuthSession(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return (
      name === "authjs.session-token" ||
      name === "__Secure-authjs.session-token" ||
      name.startsWith("authjs.session-token.") ||
      name.startsWith("__Secure-authjs.session-token.")
    );
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasAuthSession(request);
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
