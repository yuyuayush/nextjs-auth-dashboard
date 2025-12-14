import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession(req);

  console.log({ session });

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth/signin") || req.nextUrl.pathname.startsWith("/auth/signup");

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/map/:path*", "/auth/:path*"],
};