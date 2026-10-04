import { NextResponse, type NextRequest } from "next/server";

// Visitors without a login cookie are sent to the login form straight away, before the
// admin page is rendered. (The admin page still fully verifies the login itself.)
export function proxy(request: NextRequest) {
  if (!request.cookies.has("admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin" };
