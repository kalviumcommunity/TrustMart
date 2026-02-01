import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { ZodError } from "zod";
import { userSchema, userUpdateSchema } from "../../../lib/schemas/userSchema";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get user information from middleware headers
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");
    
    // Simulate fetching users from database
    const users = [
      { id: 1, name: "Alice", email: "alice@example.com", age: 25, role: "user", isActive: true },
      { id: 2, name: "Bob", email: "bob@example.com", age: 30, role: "admin", isActive: true },
      { id: 3, name: "Charlie", email: "charlie@example.com", age: 28, role: "user", isActive: false }
    ];
    
    // If user is not admin, only return active users
    const filteredUsers = userRole === "admin" 
      ? users 
      : users.filter(user => user.isActive);
    
    return sendSuccess({
      users: filteredUsers,
      requestedBy: {
        id: userId,
        email: userEmail,
        role: userRole
      },
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length
    }, "Users fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch users", 
      ERROR_CODES.USER_FETCH_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get user information from middleware headers
    const requestingUserRole = req.headers.get("x-user-role");
    const requestingUserId = req.headers.get("x-user-id");
    
    // Validate input using Zod schema
    const validatedData = userSchema.parse(body);
    
    // Only admins can create admin users
    if (validatedData.role === "admin" && requestingUserRole !== "admin") {
      return sendError(
        "Only admins can create admin users", 
        ERROR_CODES.FORBIDDEN, 
        403
      );
    }
    
    // Simulate creating a user
    const newUser = {
      id: Date.now(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      createdBy: requestingUserId
    };
    
    return sendSuccess(newUser, "User created successfully", 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return sendError(
        "Validation failed", 
        ERROR_CODES.VALIDATION_ERROR, 
        400, 
        err.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      );
    }
    
    return sendError(
      "Failed to create user", 
      ERROR_CODES.USER_CREATION_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return sendError(
        "Missing user ID in query parameters", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    const body = await req.json();
    
    // Get user information from middleware headers
    const requestingUserRole = req.headers.get("x-user-role");
    const requestingUserId = req.headers.get("x-user-id");
    
    // Users can only update their own profile, admins can update anyone
    if (requestingUserRole !== "admin" && requestingUserId !== userId) {
      return sendError(
        "You can only update your own profile", 
        ERROR_CODES.FORBIDDEN, 
        403
      );
    }
    
    // Validate input using Zod schema
    const validatedData = userUpdateSchema.parse(body);
    
    // Only admins can change roles
    if (validatedData.role && requestingUserRole !== "admin") {
      return sendError(
        "Only admins can change user roles", 
        ERROR_CODES.FORBIDDEN, 
        403
      );
    }
    
    // Simulate updating a user
    const updatedUser = {
      id: parseInt(userId),
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: requestingUserId
    };
    
    return sendSuccess(updatedUser, "User updated successfully");
  } catch (err) {
    if (err instanceof ZodError) {
      return sendError(
        "Validation failed", 
        ERROR_CODES.VALIDATION_ERROR, 
        400, 
        err.issues.map((e: any) => ({ field: e.path.join('.'), message: e.message }))
      );
    }
    
    return sendError(
      "Failed to update user", 
      ERROR_CODES.USER_UPDATE_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
