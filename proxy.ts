import { NextResponse, type NextRequest } from "next/server";

const TAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Home page: `/?tab=kitchen` (ad links) is answered with the pre-built page for that category.
  // The address bar keeps the original URL (and any ad tracking parameters).
  if (pathname === "/") {
    const tab = searchParams.get("tab");
    if (tab && tab.length <= 24 && TAB.test(tab)) {
      return NextResponse.rewrite(new URL(`/t/${tab}`, request.url));
    }
    return NextResponse.next();
  }

  // /admin: visitors without a login cookie go straight to the login form, before the admin page
  // is rendered. (The admin page still fully verifies the login itself.)
  if (!request.cookies.has("admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/admin"] };
