import { NextResponse, NextRequest } from "next/server";
import { stackServerApp } from "./lib/stack/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes using Stack Auth
  if (pathname.startsWith("/dashboard")) {
    try {
      const user = await stackServerApp.getUser();

      // If no authenticated user, redirect to sign-in page
      if (!user) {
        const signInUrl = new URL(stackServerApp.urls.signIn, request.url);
        // Add redirect parameter to return to intended page after sign-in
        signInUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      // If authentication check fails, redirect to sign-in page
      console.error("Auth middleware error:", error);
      const signInUrl = new URL(stackServerApp.urls.signIn, request.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
