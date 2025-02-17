# To-Do List API

## Description
A simple REST API for managing a to-do list. It allows users to perform CRUD operations on tasks and users.

## Features
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

DB_USER=your_db_user
DB_HOST=your_db_host
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port



## Endpoints
## Users Endpoints

- **GET** `/users`: Get all users
- **GET** `/users/:uid`: Get a particular user by UID
- **GET** `/users/tasks/:uid`: Get tasks of a particular user by UID
- **POST** `/users`: Add a new user
- **PUT** `/users/:uid`: Update a user
- **DELETE** `/users/:uid`: Delete a user by UID

## Tasks Endpoints

- **GET** `/tasks`: Get all tasks
- **GET** `/tasks/:uid`: Get tasks for a specific user
- **POST** `/tasks`: Add a new task
- **PUT** `/tasks/:tid`: Update a task by task ID
- **PUT** `/tasks/status/:tid`: Update the task status
- **DELETE** `/tasks/:tid`: Delete a task by task ID

## Setup and Installation

## Clone the repository:
   ```bash
   git clone https://github.com/your-username/todo-list-api.git
   ```


## Navigate to the project directory:

   ```bash
   cd todo-list-api
   ```

## Install dependencies:

   ```bash
   npm install
   ```

## Start the server:

   ```bash
   npm start
   ```

## The API will be running on http://localhost:3000.
