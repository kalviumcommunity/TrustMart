import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";

export async function GET() {
  try {
    // Simulate fetching users from database
    const users = [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Charlie", email: "charlie@example.com" }
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
    const data = await req.json();
    
    // Validation
    if (!data.name || !data.email) {
      return sendError(
        "Missing required fields: name and email", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    // Simulate creating a user
    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString()
    };
    
    return sendSuccess(newUser, "User created successfully", 201);
  } catch (err) {
    return sendError(
      "Failed to create user", 
      ERROR_CODES.USER_CREATION_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
