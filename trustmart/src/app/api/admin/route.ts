import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get user information from middleware headers
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");
    const userName = req.headers.get("x-user-name");

    // Admin-only data
    const adminData = {
      message: "Welcome Admin! You have full access.",
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      },
      systemStats: {
        totalUsers: 1250,
        activeUsers: 890,
        totalTasks: 3420,
        completedTasks: 2890,
        systemUptime: "99.9%"
      },
      permissions: [
        "read_all_users",
        "write_all_users", 
        "delete_all_users",
        "read_all_tasks",
        "write_all_tasks",
        "delete_all_tasks",
        "system_administration"
      ]
    };
    
    return sendSuccess(adminData, "Admin dashboard data retrieved successfully");
  } catch (err) {
    return sendError(
      "Failed to retrieve admin data", 
      ERROR_CODES.INTERNAL_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get user information from middleware headers
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");
    
    // Example: Create system announcement (admin only)
    const { title, message, priority } = body;
    
    if (!title || !message) {
      return sendError(
        "Title and message are required", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    const announcement = {
      id: Date.now(),
      title,
      message,
      priority: priority || "normal",
      createdBy: userEmail,
      createdAt: new Date().toISOString()
    };
    
    return sendSuccess(announcement, "System announcement created successfully", 201);
  } catch (err) {
    return sendError(
      "Failed to create announcement", 
      ERROR_CODES.INTERNAL_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
