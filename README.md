# To-Do List API

## Description
A simple REST API for managing a to-do list. It allows users to perform CRUD operations on tasks and users.

## Features
- User authentication and authorization
- Add, update, and delete tasks
- Assign tasks to users
- Update task status (pending, done)
- User management (add, update, delete users)

## Technologies Used
- Node.js
- Express.js
- PostgreSQL

## Environment Variables

Create a `.env` file in the root directory and add:

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port
JWT_SECRET=your_jwt_secret
```  

## Authentication

- Users must **register** and **log in** to obtain an authentication token.
- Use this token in the `Authorization` header as `Bearer <token>` for accessing protected routes.
- By default, when registering normally, your role will be `user`. You need to change your role directly from the database to become an `admin`.

## Endpoints

### Authentication Endpoints
- **POST** `/register`: Register a new user
- **POST** `/login`: Log in to get an access token

### User Endpoints
- **GET** `/user`: Get information of the logged-in user
- **PUT** `/user`: Update user information
- **PUT** `/user/password`: Update user's password
- **DELETE** `/user`: Delete user account

### Task Endpoints
- **GET** `/tasks`: Get all tasks of the logged-in user
- **PUT** `/tasks/:tid`: Update a specific task
- **PUT** `/tasks/status/:tid`: Update a task's status
- **DELETE** `/tasks/:tid`: Delete a task

### Admin Endpoints
- **GET** `/admin`: Admin welcome page
- **GET** `/admin/me`: Get admin's information
- **GET** `/admin/users`: Get all users
- **GET** `/admin/users/:uid`: Get a specific user by ID
- **DELETE** `/admin/users/:uid`: Delete a specific user
- **PUT** `/admin`: Update admin information
- **DELETE** `/admin`: Delete admin account

## Setup and Installation

### Clone the repository:
```bash
git clone https://github.com/your-username/todo-list-api.git
```

### Navigate to the project directory:
```bash
cd todo-list-api
```

### Install dependencies:
```bash
npm install
```

### Start the server:
```bash
npm start
```

The API will be running on http://localhost:3000.
