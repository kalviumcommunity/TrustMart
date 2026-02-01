import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Define protected API routes and their required roles
const protectedApiRoutes = {
  "/api/admin": ["admin"],
  "/api/users": ["user", "admin", "moderator"],
  "/api/tasks": ["user", "admin", "moderator"],
};

// Define protected page routes
const protectedPageRoutes = [
  "/dashboard",
  "/users"
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle API route protection
  const protectedApiRoute = Object.keys(protectedApiRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (protectedApiRoute) {
    return handleApiRouteProtection(req, pathname, protectedApiRoute);
  }

  // Handle page route protection
  const protectedPageRoute = protectedPageRoutes.find(route => 
    pathname.startsWith(route)
  );

  if (protectedPageRoute) {
    return handlePageRouteProtection(req, pathname);
  }

  // Public routes - allow access
  return NextResponse.next();
}

function handleApiRouteProtection(req: NextRequest, pathname: string, protectedRoute: string) {
  // Extract token from Authorization header
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Authorization token missing",
        error: { code: "TOKEN_MISSING" }
      }, 
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Get required roles for this route
    const requiredRoles = protectedApiRoutes[protectedRoute as keyof typeof protectedApiRoutes];
    
    // Check if user has required role
    if (!requiredRoles.includes(decoded.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Access denied: insufficient permissions",
          error: { 
            code: "INSUFFICIENT_PERMISSIONS",
            details: `Required roles: ${requiredRoles.join(", ")}, User role: ${decoded.role}`
          }
        }, 
        { status: 403 }
      );
    }

    // Attach user information to request headers for downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.id?.toString() || "");
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-name", decoded.name || "");

    // Return request with added headers
    return NextResponse.next({ 
      request: { headers: requestHeaders } 
    });

  } catch (error) {
    // Handle different JWT errors
    let errorMessage = "Invalid or expired token";
    let errorCode = "TOKEN_INVALID";

    if (error instanceof jwt.TokenExpiredError) {
      errorMessage = "Token has expired";
      errorCode = "TOKEN_EXPIRED";
    } else if (error instanceof jwt.JsonWebTokenError) {
      errorMessage = "Invalid token format";
      errorCode = "TOKEN_MALFORMED";
    }

    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: { code: errorCode }
      }, 
      { status: 403 }
    );
  }
}

function handlePageRouteProtection(req: NextRequest, pathname: string) {
  // Extract token from cookies for page routes
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // Redirect to login page
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET);
    
    // Token is valid, allow access
    return NextResponse.next();

  } catch (error) {
    // Token is invalid or expired, redirect to login
    const loginUrl = new URL("/login", req.url);
    
    // Clear the invalid token
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    
    return response;
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/users/:path*", 
    "/api/tasks/:path*",
    "/api/auth/profile",
    "/dashboard/:path*",
    "/users/:path*"
  ]
};
