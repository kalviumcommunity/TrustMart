import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { ZodError } from "zod";
import { userSchema, userUpdateSchema } from "../../../lib/schemas/userSchema";

export async function GET() {
  try {
    // Simulate fetching users from database
    const users = [
      { id: 1, name: "Alice", email: "alice@example.com", age: 25, role: "user", isActive: true },
      { id: 2, name: "Bob", email: "bob@example.com", age: 30, role: "admin", isActive: true },
      { id: 3, name: "Charlie", email: "charlie@example.com", age: 28, role: "user", isActive: false }
    ];
    
    return sendSuccess(users, "Users fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch users", 
      ERROR_CODES.USER_FETCH_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input using Zod schema
    const validatedData = userSchema.parse(body);
    
    // Simulate creating a user
    const newUser = {
      id: Date.now(),
      ...validatedData,
      createdAt: new Date().toISOString()
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

export async function PUT(req: Request) {
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
    
    // Validate input using Zod schema
    const validatedData = userUpdateSchema.parse(body);
    
    // Simulate updating a user
    const updatedUser = {
      id: parseInt(userId),
      ...validatedData,
      updatedAt: new Date().toISOString()
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
