import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { ZodError } from "zod";
import { taskSchema, taskUpdateSchema } from "../../../lib/schemas/taskSchema";
import { NextRequest } from "next/server";
import { cacheUtils, cacheKeys, cacheTTL } from "../../../lib/redis";

export async function GET(req: NextRequest) {
  try {
    // Get user information from middleware headers
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");
    
    // Check cache first
    const cacheKey = cacheKeys.tasks.list;
    const cachedData = await cacheUtils.get(cacheKey);
    
    if (cachedData) {
      console.log("🎯 Cache Hit - Tasks served from Redis");
      
      return sendSuccess({
        tasks: cachedData.tasks,
        requestedBy: {
          id: userId,
          email: userEmail,
          role: userRole
        },
        totalTasks: cachedData.tasks.length,
        completedTasks: cachedData.tasks.filter((t: any) => t.status === "completed").length,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      }, "Tasks fetched successfully (cached)");
    }
    
    console.log("❄️ Cache Miss - Fetching tasks from database");
    
    // Simulate fetching tasks from database
    const tasks = [
      { 
        id: 1, 
        title: "Complete project documentation", 
        description: "Write comprehensive documentation for the API",
        status: "pending", 
        priority: "high",
        dueDate: "2025-11-15T00:00:00Z",
        assignedTo: "alice@example.com"
      },
      { 
        id: 2, 
        title: "Review pull requests", 
        description: "Review and merge pending PRs",
        status: "in-progress", 
        priority: "medium",
        assignedTo: "bob@example.com"
      },
      { 
        id: 3, 
        title: "Update dependencies", 
        description: "Update npm packages to latest versions",
        status: "completed", 
        priority: "low"
      }
    ];
    
    // Store in cache for 5 minutes
    await cacheUtils.set(cacheKey, { tasks }, cacheTTL.MEDIUM);
    
    return sendSuccess({
      tasks: tasks,
      requestedBy: {
        id: userId,
        email: userEmail,
        role: userRole
      },
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
      cached: false,
      cacheTimestamp: new Date().toISOString()
    }, "Tasks fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch tasks", 
      ERROR_CODES.TASK_FETCH_ERROR, 
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
    const validatedData = taskSchema.parse(body);
    
    // Simulate creating a task
    const newTask = {
      id: Date.now(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      createdBy: requestingUserId
    };
    
    // Invalidate cache after creation
    await cacheUtils.del(cacheKeys.tasks.list);
    await cacheUtils.del(cacheKeys.tasks.byStatus(validatedData.status));
    if (validatedData.assignedTo) {
      await cacheUtils.del(cacheKeys.tasks.byAssignee(validatedData.assignedTo));
    }
    console.log("🗑️ Cache invalidated for tasks list and related filters after creation");
    
    return sendSuccess(newTask, "Task created successfully", 201);
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
      "Failed to create task", 
      ERROR_CODES.TASK_CREATION_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return sendError(
        "Missing task ID in query parameters", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    const body = await req.json();
    
    // Get user information from middleware headers
    const requestingUserRole = req.headers.get("x-user-role");
    const requestingUserId = req.headers.get("x-user-id");
    
    // Validate input using Zod schema
    const validatedData = taskUpdateSchema.parse(body);
    
    // Simulate updating a task
    const updatedTask = {
      id: parseInt(taskId),
      ...validatedData,
      updatedAt: new Date().toISOString(),
      updatedBy: requestingUserId
    };
    
    // Invalidate relevant caches
    await cacheUtils.del(cacheKeys.tasks.list);
    await cacheUtils.del(cacheKeys.tasks.byId(parseInt(taskId)));
    
    // Invalidate status-based caches if status changed
    if (validatedData.status) {
      await cacheUtils.del(cacheKeys.tasks.byStatus(validatedData.status));
    }
    
    // Invalidate assignee caches if assignment changed
    if (validatedData.assignedTo) {
      await cacheUtils.del(cacheKeys.tasks.byAssignee(validatedData.assignedTo));
    }
    
    console.log("🗑️ Cache invalidated for tasks list and related filters after update");
    
    return sendSuccess(updatedTask, "Task updated successfully");
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
      "Failed to update task", 
      ERROR_CODES.TASK_UPDATE_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return sendError(
        "Missing task ID in query parameters", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    // Get user information from middleware headers
    const requestingUserRole = req.headers.get("x-user-role");
    const requestingUserId = req.headers.get("x-user-id");
    
    // Simulate deleting a task
    const deletedTask = {
      id: parseInt(taskId),
      deleted: true,
      deletedBy: requestingUserId,
      deletedAt: new Date().toISOString()
    };
    
    // Invalidate relevant caches
    await cacheUtils.del(cacheKeys.tasks.list);
    await cacheUtils.del(cacheKeys.tasks.byId(parseInt(taskId)));
    console.log("🗑️ Cache invalidated for tasks list and specific task after deletion");
    
    return sendSuccess(deletedTask, "Task deleted successfully");
  } catch (err) {
    return sendError(
      "Failed to delete task", 
      ERROR_CODES.TASK_DELETION_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
