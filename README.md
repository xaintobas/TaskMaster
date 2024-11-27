# TaskMaster - A Task Management System

**TaskMaster** is a full-stack web application designed to help users efficiently manage their tasks. The application provides functionality for users to create, update, delete, and filter tasks by priority or due date. It also features a robust authentication system, user-friendly interface, and secure database integration. TaskMaster is built to be scalable, secure, and optimized for performance, addressing the universal problem of task organization.

---

## Objective

The primary objective of TaskMaster is to offer users an intuitive and reliable platform for task management. By organizing tasks based on priority and deadlines, users can streamline their workflow and achieve better productivity.

---

## Technologies Used - Tech Stack

- **Backend**: Node.js, Express.js.
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing

---

## Development Tools

- **Deployment**: Render (Backend), Vercel (Frontend).
- **Version Control**: Git and GitHub
- **Testing**: Postman for API testing
- **Security**: Input validation, error handling, bcrypt for password hashing

---

## Core Functionalities

- **User Registration and Authentication**:

  - Secure registration and login system using JWT for session management.
  - Passwords hashed using bcrypt to ensure data security.
  - Role-based access ensures tasks are linked to the authenticated user.

- **Task Management**:

  - Users can create tasks with attributes such as Title, description, priority (low, medium, high), and deadline.
  - Tasks can be updated or deleted seamlessly.

- **Task Filtering**:

  - Tasks can be filtered by priority or due date, helping users focus on what matters most.

- **Search Functionality**:
  - Search bar allows users to find tasks based on keywords in the title or description.

---

## 📂 Project Structure

```plaintext

TASKMASTER/                # Root directory of the project
│
├── middleware/            # Contains reusable middleware functions
│   └── auth.js            # Middleware for handling user authentication
│
├── models/                # Contains Mongoose schemas/models for MongoDB
│   ├── Task.js            # Mongoose model for tasks
│   └── User.js            # Mongoose model for users
│
├── node_modules/          # Auto-generated directory for npm dependencies
│                          # (Should be ignored in version control with .gitignore)
│
├── public/                # Directory for static files accessible to the client
│   ├── js/                # Contains frontend JavaScript files
│   │   ├── auth.js        # Handles client-side authentication logic
│   │   ├── tasks.js       # Handles client-side task management logic
│   │   └── ui.js          # Handles UI-related client-side logic
│   ├── index.html         # Main HTML file for the application (frontend entry point)
│   └── styles.css         # Stylesheet for the application's frontend
│
├── routes/                # Directory for API route definitions
│   ├── auth.js            # Routes for user registration and authentication (login, signup)
│   └── tasks.js           # Routes for CRUD operations on tasks
│
├── .env                   # Environment variables (e.g., database URI, JWT secrets)
├── .gitignore             # Specifies files/folders to exclude from version control
├── index.js               # Entry point for the server
├── package.json           # Metadata and dependencies for the project
├── package-lock.json      # Locked dependency tree for consistent installations
├── README.md              # Project documentation and usage instructions
└── server.js              # Main entry point for the server

```

## 🗂️ API Endpoints

| **Method** | **Endpoint** | **Description**                                                                   |
| ---------- | ------------ | --------------------------------------------------------------------------------- |
| `POST`     | `/signup`    | Allows users to register by providing their full name, email, and password.       |
| `POST`     | `/login`     | Authenticates users by verifying their email and password, returning a JWT token. |
| `GET`      | `/verify`    | Validates the user's JWT token and retrieves the associated user details.         |
| `GET`      | `/`          | Gets all tasks for the authenticated user with pagination.                        |
| `POST`     | `/`          | Creates a new task for the authenticated user.                                    |
| `PUT`      | `/:id`       | Updates a specific task (:id) for the authenticated user.                         |
| `DELETE`   | `/:id`       | Deletes a specific task (:id) for the authenticated user.                         |
| `GET`      | `/:id`       | Fetches details of a specific task (:id) for the authenticated user.              |

## Author

- GitHub - https://github.com/xaintobas
- Task Master - Live Site - https://taskmaster-fnks.onrender.com/
- x.com (formerly Twitter) - https://x.com/xaint_obas
