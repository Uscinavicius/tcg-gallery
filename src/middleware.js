import { NextResponse } from "next/server";

export function middleware(request) {
  // Only require auth for admin pages and admin-related API routes
  if (
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/api/addCard") &&
    !request.nextUrl.pathname.startsWith("/api/removeCard") &&
    !request.nextUrl.pathname.startsWith("/api/updateCard") &&
    !request.nextUrl.pathname.startsWith("/api/updatePrices")
  ) {
    return NextResponse.next();
  }

  // Check for Basic Auth header
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  try {
    const authValue = authHeader.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.ADMIN_USERNAME &&
      pwd === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.next();
    }
  } catch (err) {
    // Handle any errors in auth header parsing
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    // Match admin pages and admin-related API routes
    "/admin/:path*",
    "/api/addCard/:path*",
    "/api/removeCard/:path*",
    "/api/updateCard/:path*",
    "/api/updatePrices/:path*",
  ],
};
