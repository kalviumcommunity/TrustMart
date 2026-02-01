import { sendSuccess, sendError } from "../../../lib/responseHandler";
import { ERROR_CODES } from "../../../lib/errorCodes";

export async function GET() {
  try {
    // Simulate fetching tasks from database
    const tasks = [
      { id: 1, title: "Complete project documentation", status: "pending", priority: "high" },
      { id: 2, title: "Review pull requests", status: "in-progress", priority: "medium" },
      { id: 3, title: "Update dependencies", status: "completed", priority: "low" }
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
    const data = await req.json();
    
    // Validation
    if (!data.title) {
      return sendError(
        "Missing required field: title", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    if (!data.status || !['pending', 'in-progress', 'completed'].includes(data.status)) {
      return sendError(
        "Invalid status. Must be: pending, in-progress, or completed", 
        ERROR_CODES.VALIDATION_ERROR, 
        400
      );
    }
    
    // Simulate creating a task
    const newTask = {
      id: Date.now(),
      title: data.title,
      status: data.status,
      priority: data.priority || 'medium',
      createdAt: new Date().toISOString()
    };
    
    return sendSuccess(newTask, "Task created successfully", 201);
  } catch (err) {
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
    
    const data = await req.json();
    
    // Simulate updating a task
    const updatedTask = {
      id: parseInt(taskId),
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return sendSuccess(updatedTask, "Task updated successfully");
  } catch (err) {
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
