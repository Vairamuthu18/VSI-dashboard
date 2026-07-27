import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that do not require authentication
const PUBLIC_PATHS = [
  "/",
  "/features",
  "/auth/login",
  "/auth/register",
  "/privacy",
  "/r",
  "/qa",
  "/api/qa",
  "/api/cron",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Allow public routes to pass through unchanged
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return response;
  }

  // Redirect root to dashboard for authenticated users
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://")) {
  //   throw new Error("Invalid Supabase URL");
  // }
  // if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  //   throw new Error("Supabase environment variables are missing.");
  // }

  // Bypass supabase completely in middleware
  return response;
  
  /*
  // Initialize Supabase client to read auth cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If no authenticated user, redirect to login page
  // BYPASSED FOR NOW
  // if (!user) {
  //   const loginUrl = new URL('/auth/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }
  */

  // Authenticated user – proceed to requested page
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
