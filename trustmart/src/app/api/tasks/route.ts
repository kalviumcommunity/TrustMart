import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";
import { ZodError } from "zod";
import { taskSchema, taskUpdateSchema } from "../../../lib/schemas/taskSchema";

export async function GET() {
  try {
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
    
    return sendSuccess(tasks, "Tasks fetched successfully");
  } catch (err) {
    return sendError(
      "Failed to fetch tasks", 
      ERROR_CODES.TASK_FETCH_ERROR, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input using Zod schema
    const validatedData = taskSchema.parse(body);
    
    // Simulate creating a task
    const newTask = {
      id: Date.now(),
      ...validatedData,
      createdAt: new Date().toISOString()
    };
    
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

export async function PUT(req: Request) {
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
    
    // Validate input using Zod schema
    const validatedData = taskUpdateSchema.parse(body);
    
    // Simulate updating a task
    const updatedTask = {
      id: parseInt(taskId),
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
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

export async function DELETE(req: Request) {
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
    
    // Simulate deleting a task
    return sendSuccess(
      { id: parseInt(taskId), deleted: true }, 
      "Task deleted successfully"
    );
  } catch (err) {
    return sendError(
      "Failed to delete task", 
      ERROR_CODES.TASK_DELETION_FAILED, 
      500, 
      err instanceof Error ? err.message : "Unknown error"
    );
  }
}
