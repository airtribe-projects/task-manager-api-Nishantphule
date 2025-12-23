# Task Manager API

A RESTful API for managing tasks built with Node.js and Express.js. This API provides CRUD operations for tasks with in-memory data storage, input validation, and comprehensive error handling.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Input validation for all endpoints
- ✅ Error handling with appropriate HTTP status codes
- ✅ Filtering by completion status
- ✅ Sorting by creation date
- ✅ Priority levels (low, medium, high)
- ✅ Filter tasks by priority level
- ✅ In-memory data storage

## Prerequisites

- Node.js >= 18.0.0
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server:
```bash
node app.js
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Get All Tasks
**GET** `/tasks`

Retrieve all tasks. Supports optional filtering by completion status and sorting by creation date.

**Query Parameters:**
- `completed` (optional): Filter by completion status (`true` or `false`)
- `sort` (optional): Sort by creation date (`createdAt` or `created_at`)
- `order` (optional): Sort order (`asc` for ascending/default, `desc` for descending)

**Example:**
```bash
# Get all tasks
curl http://localhost:3000/tasks

# Get only completed tasks
curl http://localhost:3000/tasks?completed=true

# Get only incomplete tasks
curl http://localhost:3000/tasks?completed=false

# Get all tasks sorted by creation date (oldest first)
curl http://localhost:3000/tasks?sort=createdAt

# Get all tasks sorted by creation date (newest first)
curl http://localhost:3000/tasks?sort=createdAt&order=desc

# Combine filtering and sorting
curl http://localhost:3000/tasks?completed=false&sort=createdAt&order=desc
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Set up environment",
    "description": "Install Node.js, npm, and git",
    "completed": true,
    "priority": "medium",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

### 2. Get Tasks by Priority Level
**GET** `/tasks/priority/:level`

Retrieve all tasks with a specific priority level.

**Path Parameters:**
- `level`: Priority level (`low`, `medium`, or `high`)

**Example:**
```bash
# Get all high priority tasks
curl http://localhost:3000/tasks/priority/high

# Get all medium priority tasks
curl http://localhost:3000/tasks/priority/medium

# Get all low priority tasks
curl http://localhost:3000/tasks/priority/low
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "High Priority Task",
    "description": "This is urgent",
    "completed": false,
    "priority": "high",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  ...
]
```

**Error Response:** `400 Bad Request` (if invalid priority level)
```json
{
  "error": "Invalid priority level. Must be one of: low, medium, high"
}
```

### 3. Get Task by ID
**GET** `/tasks/:id`

Retrieve a specific task by its ID.

**Example:**
```bash
curl http://localhost:3000/tasks/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true
}
```

**Error Response:** `404 Not Found` (if task doesn't exist)
```json
{
  "error": "Task not found"
}
```

### 4. Create a New Task
**POST** `/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "completed": false,
  "priority": "high"
}
```

**Fields:**
- `title` (required): Task title (non-empty string)
- `description` (required): Task description (non-empty string)
- `completed` (optional): Completion status (boolean, defaults to `false`)
- `priority` (optional): Priority level (`low`, `medium`, or `high`, defaults to `medium`)

**Example:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","completed":false}'
```

**Response:** `201 Created`
```json
{
  "id": 16,
  "title": "New Task",
  "description": "Task description",
  "completed": false,
  "priority": "high",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:** `400 Bad Request` (if validation fails)
```json
{
  "error": "Title is required and must be a non-empty string, Description is required and must be a non-empty string"
}
```

### 5. Update a Task
**PUT** `/tasks/:id`

Update an existing task. All fields are optional, but provided fields must be valid.

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "completed": true,
  "priority": "low"
}
```

**Fields:**
- `title` (optional): Task title (non-empty string)
- `description` (optional): Task description (non-empty string)
- `completed` (optional): Completion status (boolean)
- `priority` (optional): Priority level (`low`, `medium`, or `high`)

**Example:**
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"Updated description","completed":true}'
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Updated Task",
  "description": "Updated description",
  "completed": true,
  "priority": "low",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` (if task doesn't exist)
- `400 Bad Request` (if validation fails)

### 6. Delete a Task
**DELETE** `/tasks/:id`

Delete a task by its ID.

**Example:**
```bash
curl -X DELETE http://localhost:3000/tasks/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true
}
```

**Error Response:** `404 Not Found` (if task doesn't exist)
```json
{
  "error": "Task not found"
}
```

## Validation Rules

- **Title**: Required, must be a non-empty string
- **Description**: Required, must be a non-empty string
- **Completed**: Required, must be a boolean (`true` or `false`)
- **Priority**: Optional, must be one of: `low`, `medium`, or `high` (defaults to `medium`)

For PUT requests, all fields are optional, but any provided field must meet the validation requirements.

## Task Schema

Each task has the following structure:
```json
{
  "id": 1,
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "priority": "medium",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

- `id`: Unique identifier (auto-generated, number)
- `title`: Task title (string, required)
- `description`: Task description (string, required)
- `completed`: Completion status (boolean, defaults to `false`)
- `priority`: Priority level (`low`, `medium`, or `high`, defaults to `medium`)
- `createdAt`: ISO 8601 timestamp of creation (auto-generated)

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT, or DELETE request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid input data or validation errors
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server-side errors

## Testing

Run the test suite:
```bash
npm test
```

The tests verify all CRUD operations, error handling, and input validation.

## Project Structure

```
task-manager-api/
├── app.js              # Main application file with all routes
├── package.json        # Project dependencies and scripts
├── test/
│   └── server.test.js # Test suite
└── README.md          # This file
```

## Notes

- Tasks are stored in-memory only (no file persistence)
- Task IDs are auto-generated and increment from the highest existing ID
- The server starts with an empty task list - all tasks must be created via the API
- All data is lost when the server restarts (data is not persisted)
- All string fields are automatically trimmed of whitespace

