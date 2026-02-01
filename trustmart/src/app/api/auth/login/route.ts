import { sendSuccess, sendError } from "../../../../lib/responseHandler";
import { ERROR_CODES } from "../../../../lib/errorCodes";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

// Mock user database (in production, this would be a real database)
const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123", // In production, use hashed passwords
    role: "admin",
    isActive: true
  },
  {
    id: 2,
    name: "Regular User",
    email: "user@example.com", 
    password: "user123", // In production, use hashed passwords
    role: "user",
    isActive: true
  },
  {
    id: 3,
    name: "Moderator User",
    email: "moderator@example.com",
    password: "mod123", // In production, use hashed passwords
    role: "moderator",
    isActive: true
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input using Zod schema
    const validatedData = loginSchema.parse(body);
    
    // Find user by email
    const user = mockUsers.find(u => u.email === validatedData.email);
    
    if (!user) {
      return sendError(
        "Invalid credentials", 
        ERROR_CODES.UNAUTHORIZED, 
        401,
        "User not found"
      );
    }
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== validatedData.password) {
      return sendError(
        "Invalid credentials", 
        ERROR_CODES.UNAUTHORIZED, 
        401,
        "Incorrect password"
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return sendError(
        "Account is deactivated", 
        ERROR_CODES.UNAUTHORIZED, 
        401,
        "Please contact administrator"
      );
    }
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    // Return user info and token (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    return sendSuccess({
      user: userWithoutPassword,
      token,
      expiresIn: "24h"
    }, "Login successful");
    
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
      "Login failed", 
      ERROR_CODES.INTERNAL_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
