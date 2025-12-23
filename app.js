const express = require("express");
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage
let tasks = [];

// Helper function to get next ID
function getNextId() {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((task) => task.id)) + 1;
}

// Validation helper function
function validateTask(task, isUpdate = false) {
  const errors = [];
  const validPriorities = ["low", "medium", "high"];

  if (!isUpdate || task.title !== undefined) {
    if (
      !task.title ||
      typeof task.title !== "string" ||
      task.title.trim() === ""
    ) {
      errors.push("Title is required and must be a non-empty string");
    }
  }

  if (!isUpdate || task.description !== undefined) {
    if (
      !task.description ||
      typeof task.description !== "string" ||
      task.description.trim() === ""
    ) {
      errors.push("Description is required and must be a non-empty string");
    }
  }

  if (!isUpdate || task.completed !== undefined) {
    if (typeof task.completed !== "boolean") {
      errors.push("Completed must be a boolean value");
    }
  }

  if (!isUpdate || task.priority !== undefined) {
    if (
      task.priority &&
      !validPriorities.includes(task.priority.toLowerCase())
    ) {
      errors.push("Priority must be one of: low, medium, high");
    }
  }

  return errors;
}

// GET /tasks - Get all tasks with optional filtering and sorting
app.get("/tasks", (req, res) => {
  try {
    let filteredTasks = [...tasks];

    // Filter by completed status if query parameter is provided
    if (req.query.completed !== undefined) {
      const completed = req.query.completed === "true";
      filteredTasks = filteredTasks.filter(
        (task) => task.completed === completed
      );
    }

    // Sort by creation date if sort parameter is provided
    if (req.query.sort === "createdAt" || req.query.sort === "created_at") {
      filteredTasks.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        // Default to ascending order (oldest first)
        const order = req.query.order === "desc" ? -1 : 1;
        return order * (dateA - dateB);
      });
    }

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tasks/priority/:level - Get tasks by priority level
app.get("/tasks/priority/:level", (req, res) => {
  try {
    const level = req.params.level.toLowerCase();
    const validPriorities = ["low", "medium", "high"];

    if (!validPriorities.includes(level)) {
      return res.status(400).json({
        error: "Invalid priority level. Must be one of: low, medium, high",
      });
    }

    const filteredTasks = tasks.filter(
      (task) => (task.priority || "medium").toLowerCase() === level
    );

    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /tasks/:id - Get a specific task by ID
app.get("/tasks/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /tasks - Create a new task
app.post("/tasks", (req, res) => {
  try {
    const validationErrors = validateTask(req.body, false);

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(", ") });
    }

    const newTask = {
      id: getNextId(),
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      completed: req.body.completed || false,
      priority: (req.body.priority || "medium").toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /tasks/:id - Update an existing task
app.put("/tasks/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Validate the update data
    const updateData = req.body;
    const validationErrors = validateTask(updateData, true);

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(", ") });
    }

    // Update the task
    const updatedTask = {
      ...tasks[taskIndex],
      ...updateData,
      id: tasks[taskIndex].id, // Ensure ID cannot be changed
      createdAt: tasks[taskIndex].createdAt, // Ensure createdAt cannot be changed
    };

    // Trim string fields if they exist
    if (updatedTask.title) updatedTask.title = updatedTask.title.trim();
    if (updatedTask.description)
      updatedTask.description = updatedTask.description.trim();

    // Normalize priority to lowercase if provided
    if (updatedTask.priority) {
      updatedTask.priority = updatedTask.priority.toLowerCase();
    }

    tasks[taskIndex] = updatedTask;
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];
    res.status(200).json(deletedTask);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET / - Root route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Task Manager API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Only start the server if this file is run directly (not when imported)
if (require.main === module) {
  app.listen(port, (err) => {
    if (err) {
      return console.log("Something bad happened", err);
    }
    console.log(`Server is listening on ${port}`);
  });
}

module.exports = app;
